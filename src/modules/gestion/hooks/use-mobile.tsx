import * as React from "react"

const MOBILE_BREAKPOINT = 768

// Initialisation synchrone (app 100% client) : démarrer à `undefined` faisait
// rendre un premier frame desktop sur mobile (sidebar visible, bottom nav absente)
// avant la bascule dans l'effet → flash de layout et travail de rendu inutile.
const getIsMobile = () =>
  typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(getIsMobile)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
