// Lien d'evitement, premier element focusable de chaque page.
//
// Il vit dans la couche `app` et non dans les sites: c'est le seul endroit
// commun aux cinq identites, ce qui evite de recopier le meme lien cinq fois.
// Les couleurs passent par les tokens `--site-*`, donc le lien adopte
// automatiquement la direction artistique du site affiche.
//
// Invisible tant qu'il n'a pas le focus (`sr-only`), il apparait des la
// premiere tabulation et permet de sauter la navigation pour rejoindre
// directement `#contenu-principal`.
export function SkipLink() {
  return (
    <a
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[var(--site-ink)] focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-[var(--site-background)] focus:no-underline focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--site-accent)] focus:ring-offset-2"
      href="#contenu-principal"
    >
      Aller au contenu principal
    </a>
  );
}
