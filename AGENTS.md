<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Application structure
- Keep the imported Rakuev feature modules and existing client-side demonstration flows; this redesign must not change business behavior or imply production authentication.
- Use ServiceShell for both citizen and internal workspaces with role-specific navigation, so menu placement and presentation remain consistent.
- Keep brand and partner logos in the shared Brand and PartnerLogos components, with uploaded media referenced through asset pointers to maintain uniform presentation.
- Define presentation tokens, field animations and responsive layout rules in src/styles.css, so all pages share one design system.
