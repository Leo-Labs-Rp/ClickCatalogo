# Design system do ClickCatálogo

## Organização

```text
src/
  styles/
    tokens.css       # tokens globais da aplicação
    themes.css       # fonte única das seis paletas das lojas
  components/
    ui/              # componentes genéricos de formulário e feedback
    loja-publica/    # componentes específicos do catálogo público
    design-system/   # vitrine temporária desta etapa
    icons/           # ícones locais não fornecidos pela biblioteca
  lib/
    design-system/   # metadados dos temas e dados de demonstração
    format/          # formatações reutilizáveis
    whatsapp/        # criação segura dos links de pedido
    utils/           # utilitários sem regra de negócio
```

## Regras

1. Cores e espaçamentos compartilhados devem virar tokens; não repetir valores hexadecimais em páginas.
2. A paleta da loja é aplicada somente pelo atributo `data-tema`.
3. Páginas compõem componentes e não recriam botões, inputs ou cards manualmente.
4. Componentes genéricos ficam em `components/ui`; regras do catálogo ficam em `components/loja-publica`.
5. O preview do cadastro e do painel deve usar `StorePreview`, `StoreHeader` e `ProductCard`, os mesmos componentes da loja pública.
6. Toda mudança nas paletas deve passar por `npm run check:contrast`.

## Temas

Os seis temas são `classico`, `natural`, `tech`, `delivery`, `elegante` e `minimal`. Cada bloco em `themes.css` deve declarar:

- `--cor-primaria`
- `--cor-fundo`
- `--cor-texto`
- `--cor-destaque`
- `--cor-no-destaque`
- `--cor-superficie`
- `--cor-borda`
- `--cor-texto-suave`
- `--cor-imagem-fundo`

## Uso

```tsx
<div data-tema="natural">
  <ProductCard product={product} storeName={store.nome_loja} whatsapp={store.whatsapp} />
</div>
```

Para seleção com preview ao vivo, use `ThemePicker` controlado e passe o valor para `StorePreview`.
