# Revisão de usabilidade — mobile e desktop

Revisão do código e dos fluxos em 11/11/2026. Abrange painel, personalização, navegação, catálogo, empresa, galeria e os oito editores disponíveis. A inspeção visual em navegador não foi possível: o serviço de acesso ao navegador estava indisponível. Os testes de largura usam DOM simulado e não substituem a conferência em dispositivos reais.

## Problemas encontrados e mudanças

| Área | Problema | Correção |
| --- | --- | --- |
| Prévias dos editores | Dimensões ligadas à janela, ou redução da própria arte, podiam cortar conteúdo e alterar a composição. | Prévia ajustada à largura real do painel, preservando as dimensões originais da arte. O ajuste acompanha redimensionamento e mudança de orientação. |
| Prévia do orçamento | O cálculo de escala desconsiderava o espaço ocupado pela navegação lateral. | Ajuste pelo espaço útil do painel. A opção de zoom em 100% continua disponível com rolagem interna. |
| Exportação no celular | A prévia fica oculta durante a edição e pode fornecer medidas zeradas para a captura. | A cópia usada na exportação fica isolada dos pais ocultos e dos limites de rolagem, com a escala original restaurada. |
| Menu mobile | O foco podia sair do menu e alcançar controles ao fundo. | Contenção de foco, bloqueio do conteúdo ao fundo, fechamento com Esc e restauração de foco. Ao ampliar para desktop, o menu libera o conteúdo. |
| Formulários | Vários campos dependiam do placeholder e tinham rótulos sem associação. | Rótulos visíveis associados aos campos; teclados de telefone, e-mail e endereço web nos dados de contato. |
| Painéis do orçamento | Adicionar item, compartilhar e editar sugestões não tinham uma estrutura de diálogo acessível. | Diálogos em portal, com nomes acessíveis, foco contido, suporte a textarea, Esc e retorno ao botão de origem. |
| Telas estreitas | Grades de formulários e edição de sugestões podiam ficar apertadas. | Uma coluna em telas pequenas, limites mínimos de largura corrigidos e ações com quebra de linha. |
| Barra inferior do orçamento | O espaço da área segura podia reduzir a altura disponível dos controles. | Altura e espaço de conteúdo consideram a área segura; navegação horizontal mantém todas as sete etapas acessíveis. |
| Navegação por teclado | Faltava um caminho direto para o conteúdo e alguns botões só tinham ícones. | Link “Ir para o conteúdo”, regiões principais identificadas e nomes acessíveis em ações de ícones. |
| Tela da empresa | O painel continuava montado atrás do cadastro, com controles alcançáveis pelo teclado. | Apenas o conteúdo da empresa fica ativo nessa tela. |
| Feedback | Algumas exportações informavam falhas somente no console. | Mensagens de sucesso e erro para papel timbrado e apresentações. |
| Carregamento | Bibliotecas pesadas de exportação participavam da carga inicial. | Carregamento sob demanda de html2canvas e jsPDF. O arquivo principal passou de aproximadamente 299 KB para 125 KB gzip, uma redução de cerca de 58% nesse arquivo. |

## Validação realizada

- 47 testes automatizados aprovados.
- Lint e compilação de produção aprovados.
- Fluxos de navegação pelas oito categorias, perfis, galeria e troca de conta.
- Lógica de navegação do orçamento em larguras simuladas de 320, 375, 768, 900 e 1280 px.
- Ajuste de escala da prévia em áreas úteis de 240 a 1000 px e recálculo no redimensionamento.
- Exportação multipágina, ordem das folhas, falha sem salvar arquivo parcial e captura de uma prévia originalmente oculta.
- Cancelamento, contenção de foco, Esc e restauração de foco nos diálogos e menu mobile.

## Conferência visual pendente

Ainda é necessária a conferência real em Safari/iOS, Chrome/Android e navegador desktop: retrato e paisagem, teclado virtual aberto, zoom de texto, imagens grandes e inspeção dos arquivos exportados. Esta revisão não afirma compatibilidade visual de 100% sem essas verificações.
