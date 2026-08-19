
import { useState } from 'react';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { MfaEnrollment } from '@/components/auth/MfaEnrollment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Eye, 
  Lock, 
  TrendingUp,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

const SecurityPanel = () => {
  const { dashboard, loading, refreshDashboard, resolveAlert } = useSecurityMonitoring();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'authentication': return <Lock className="h-4 w-4" />;
      case 'authorization': return <Shield className="h-4 w-4" />;
      case 'suspicious_activity': return <AlertTriangle className="h-4 w-4" />;
      case 'security_violation': return <XCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    // La protection du compte reste affichée pendant le chargement des
    // indicateurs : c'est le seul réglage agissant de cette page, il n'a pas à
    // attendre un tableau de bord qui ne le concerne pas.
    return (
      <div className="space-y-6">
        <MfaEnrollment />
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Chargement du tableau de bord sécurité...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Protection du compte : réglage réel, avant les indicateurs. */}
      <MfaEnrollment />

      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Événements Totaux</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.statistics.totalEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes Actives</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{dashboard.statistics.activeAlerts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions Suspectes</CardTitle>
            <Eye className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{dashboard.intrusionStats.suspiciousSessions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score de Risque Moyen</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{dashboard.intrusionStats.averageRiskScore}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Recommandations de sécurité */}
      {dashboard.recommendations.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Recommandations de sécurité :</strong>
            <ul className="mt-2 space-y-1">
              {dashboard.recommendations.map((rec, index) => (
                <li key={index} className="text-sm">• {rec}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Onglets principal */}
      <Tabs defaultValue="events" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="events">Événements</TabsTrigger>
            <TabsTrigger value="alerts">Alertes</TabsTrigger>
            <TabsTrigger value="monitoring">Surveillance</TabsTrigger>
          </TabsList>
          <Button onClick={refreshDashboard} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Événements de Sécurité Récents</CardTitle>
              <CardDescription>
                Les 50 derniers événements de sécurité enregistrés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {dashboard.events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(event.type)}
                      <div>
                        <p className="text-sm font-medium">{event.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getSeverityColor(event.severity)}>
                      {event.severity}
                    </Badge>
                  </div>
                ))}
                {dashboard.events.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    Aucun événement de sécurité enregistré
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Alertes de Sécurité</CardTitle>
              <CardDescription>
                Alertes actives nécessitant une attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dashboard.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="font-medium">{alert.title}</p>
                        <p className="text-sm text-gray-600">{alert.description}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Résoudre
                      </Button>
                    </div>
                  </div>
                ))}
                {dashboard.alerts.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    Aucune alerte active - Système sécurisé
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Surveillance en Temps Réel</CardTitle>
                <CardDescription>
                  Statistiques de détection d'intrusion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {dashboard.intrusionStats.activeSessions}
                    </div>
                    <p className="text-sm text-gray-600">Sessions Actives</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">
                      {dashboard.intrusionStats.suspiciousSessions}
                    </div>
                    <p className="text-sm text-gray-600">Sessions Suspectes</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">
                      {dashboard.intrusionStats.blockedSessions}
                    </div>
                    <p className="text-sm text-gray-600">Sessions Bloquées</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">
                      {dashboard.intrusionStats.averageRiskScore}%
                    </div>
                    <p className="text-sm text-gray-600">Risque Moyen</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Système de Protection</CardTitle>
                <CardDescription>
                  État des mesures de sécurité
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Chiffrement des données</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Actif
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Détection d'intrusion</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Actif
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Surveillance en temps réel</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Actif
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Politiques RLS</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Activées
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de détails d'événement */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-2xl w-full mx-4">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getTypeIcon(selectedEvent.type)}
                <span>Détail de l'Événement</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Type :</label>
                  <p className="text-sm">{selectedEvent.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Sévérité :</label>
                  <Badge variant={getSeverityColor(selectedEvent.severity)}>
                    {selectedEvent.severity}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Description :</label>
                  <p className="text-sm">{selectedEvent.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Horodatage :</label>
                  <p className="text-sm">{new Date(selectedEvent.timestamp).toLocaleString()}</p>
                </div>
                {selectedEvent.metadata && (
                  <div>
                    <label className="text-sm font-medium">Métadonnées :</label>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(selectedEvent.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                  Fermer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SecurityPanel;
