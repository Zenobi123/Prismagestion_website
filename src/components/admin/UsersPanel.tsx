
import { useState } from "react";
import { Check, ChevronsUpDown, Plus, Trash, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Types pour les utilisateurs
type UserRole = "Admin" | "Éditeur" | "Auteur";

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lastLogin: string;
};

// Utilisateurs mockés vides - à remplacer par des données réelles
const mockUsers: User[] = [];

const roles = [
  { label: "Admin", value: "Admin" },
  { label: "Éditeur", value: "Éditeur" },
  { label: "Auteur", value: "Auteur" },
] as const;

const formSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  role: z.enum(["Admin", "Éditeur", "Auteur"] as const),
});

type FormValues = z.infer<typeof formSchema>;

const UsersPanel = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "Auteur",
    },
  });

  const editForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "Auteur",
    },
  });

  const onSubmit = (values: FormValues) => {
    const newUser: User = {
      id: Date.now().toString(),
      name: values.name,
      email: values.email,
      role: values.role,
      lastLogin: "Jamais",
    };

    setUsers((prev) => [...prev, newUser]);
    toast({
      title: "Utilisateur ajouté",
      description: `${values.name} a été ajouté avec le rôle ${values.role}`,
    });
    form.reset();
    setOpen(false);
  };

  const onEdit = (user: User) => {
    setEditUser(user);
    editForm.setValue("name", user.name);
    editForm.setValue("email", user.email);
    editForm.setValue("role", user.role);
    setIsEditDialogOpen(true);
  };

  const onUpdateUser = (values: FormValues) => {
    if (!editUser) return;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === editUser.id
          ? { ...u, name: values.name, email: values.email, role: values.role }
          : u
      )
    );
    toast({
      title: "Utilisateur modifié",
      description: `Les informations de ${values.name} ont été mises à jour`,
    });
    editForm.reset();
    setIsEditDialogOpen(false);
    setEditUser(null);
  };

  const onDeleteUser = (id: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
    toast({
      title: "Utilisateur supprimé",
      description: "L'utilisateur a été supprimé avec succès",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-[#2E1A47]">
            Gestion des utilisateurs
          </h2>
          <p className="text-gray-500">
            Gérez les utilisateurs et leurs permissions
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2E1A47]">
              <Plus className="mr-2 h-4 w-4" /> Ajouter un utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 py-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom complet</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom de l'utilisateur" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="email@prismagestion.site"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Rôle</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? roles.find(
                                    (role) => role.value === field.value
                                  )?.label
                                : "Sélectionner un rôle"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Rechercher un rôle..." />
                            <CommandEmpty>Aucun rôle trouvé.</CommandEmpty>
                            <CommandGroup>
                              {roles.map((role) => (
                                <CommandItem
                                  value={role.label}
                                  key={role.value}
                                  onSelect={() => {
                                    form.setValue("role", role.value);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      role.value === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {role.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="pt-4">
                  <Button type="submit" className="bg-[#2E1A47]">
                    Ajouter l'utilisateur
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
          <CardDescription>
            {users.length} utilisateur enregistré
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 text-left">Nom</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Rôle</th>
                  <th className="py-3 px-4 text-left">Dernière connexion</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="py-3 px-4">{user.name}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          "inline-block px-2 py-1 rounded text-xs font-medium",
                          user.role === "Admin"
                            ? "bg-blue-100 text-blue-800"
                            : user.role === "Éditeur"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        )}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">{user.lastLogin}</td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(user)}
                        title="Modifier"
                      >
                        <Pencil size={16} />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700"
                            title="Supprimer"
                          >
                            <Trash size={16} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Êtes-vous sûr de vouloir supprimer cet utilisateur ?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. Cet utilisateur sera
                              définitivement supprimé du système.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-500 hover:bg-red-700"
                              onClick={() => onDeleteUser(user.id)}
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier un utilisateur</DialogTitle>
          </DialogHeader>

          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onUpdateUser)}
              className="space-y-4 py-4"
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de l'utilisateur" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="email@prismagestion.site"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Rôle</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? roles.find((role) => role.value === field.value)
                                  ?.label
                              : "Sélectionner un rôle"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Rechercher un rôle..." />
                          <CommandEmpty>Aucun rôle trouvé.</CommandEmpty>
                          <CommandGroup>
                            {roles.map((role) => (
                              <CommandItem
                                value={role.label}
                                key={role.value}
                                onSelect={() => {
                                  editForm.setValue("role", role.value);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    role.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {role.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button type="submit" className="bg-[#2E1A47]">
                  Mettre à jour
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPanel;
