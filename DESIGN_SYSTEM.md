# Forma — sistema visual da aplicação

Direção: estúdio editorial, com superfícies claras, verde profundo, tipografia discreta e prévias dos materiais como protagonistas. Cor comunica ação e estado; as cores das marcas continuam pertencendo aos documentos.

## Fundações

Os tokens estão em `src/workspace.css`. Use `--ds-canvas` no ambiente, `--ds-surface` nos painéis, `--ds-ink` no texto e `--ds-muted` nas informações secundárias. `--ds-brand` identifica a ação principal; `--ds-danger` é reservado a ações destrutivas.

Escala de espaçamento: 4, 8, 12, 16, 24, 32 e 48 px. Raios: 6 px em controles, 10 px em painéis e 16 px em superfícies maiores. Evite gradientes decorativos, sombras intensas e uma cor diferente para cada ação.

Manrope é a fonte dos títulos; Inter é a fonte da interface. Playfair Display aparece apenas no destaque editorial e nas ilustrações. Os controles mantêm altura mínima de 44 px; os campos usam 16 px no mobile para evitar zoom automático.

## Componentes

- `ui.jsx`: Button, PageHeading e EmptyState. Variantes de botão: primary, secondary, ghost e light (somente sobre fundo escuro).
- `WorkspaceNav`: navegação persistente, estado atual com `aria-current` e menu recolhível em telas de até 900 px.
- `ProjectGallery`: busca, filtro, quantidade de resultados, prévia e ações explícitas em cada cartão.
- `ConfirmDialog`: portal no body, foco inicial em Cancelar, contenção de Tab, Escape e restauração do foco.

## Comportamento

Mantenha uma ação principal por contexto. Estados vazios devem explicar o próximo passo. A exclusão exige confirmação e só atualiza a interface após salvar o novo estado; em falhas de armazenamento, o projeto permanece disponível.

A navegação usa 236 px em telas largas e 210 px em telas intermediárias. Até 900 px, vira menu no cabeçalho. A galeria passa de grade fluida para duas colunas e depois uma coluna. Editores alternam entre edição e prévia no mobile. Respeite `prefers-reduced-motion` e preserve os estilos dos elementos capturados na exportação.

## Verificação

`npm test` cobre confirmação, cancelamento, persistência da exclusão, falha de armazenamento, busca e navegação. `npm run build` verifica a compilação. A aprovação visual requer conferência real em desktop e mobile.

## Personalização por pessoa

Use **Personalizar início** no painel ou **Personalizar meu espaço** na navegação. As oito áreas de atuação definem a mensagem inicial, a ação principal, os atalhos recomendados e as sugestões para novos orçamentos. A pessoa pode selecionar suas ferramentas; o catálogo completo permanece em **Todas as ferramentas**.

Preferências, projetos e rascunhos de orçamento pertencem à conta local. Um rascunho do formato antigo é associado à primeira conta que o carregar. Orçamentos em andamento e sugestões editadas são preservados ao mudar de perfil. Os modelos novos de alimentação começam com valores zerados para a pessoa preencher conforme seus produtos.

Os estilos da interface de orçamento usam os tokens `--ds-*`, inclusive nos controles com estilos inline. A função que desenha as páginas do PDF mantém as cores e a tipografia configuradas para o documento.
