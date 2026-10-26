# UNDERCOVER WHEELMAN: FOUR CITIES

Jogo 3D de direção e física com **Three.js**, **Rapier** e **Vite**, configurado para GitHub Pages no endereço:

https://luispauloalves500.github.io/wellman/

## Publicar no GitHub Pages

**Importante:** use **Settings > Pages > Build and deployment > Source: GitHub Actions**.
Não use **Deploy from a branch**, pois a raiz contém TypeScript que o navegador não consegue executar diretamente; o jogo precisa do build Vite.

1. Coloque o conteúdo **deste projeto na raiz** do repositório `luispauloalves500/wellman` (incluindo a pasta `.github`, que fica oculta no Windows).
2. Faça commit na branch `main`.
3. No GitHub, acesse **Settings > Pages > Source** e escolha **GitHub Actions**.
4. Em **Actions > Deploy Wellman to GitHub Pages**, acompanhe os jobs **build** e **deploy** (ou rode **Run workflow**).
5. Quando o deploy terminar com sucesso, abra https://luispauloalves500.github.io/wellman/ .

O workflow instala as dependências, executa `npm run build`, verifica o `dist/index.html` e publica a pasta `dist`.
`vite.config.ts` utiliza `base: '/wellman/'` para resolver os assets na subpasta correta.

## Rodar e testar localmente

Necessário Node.js 22 ou mais recente:

```sh
npm install
npm run build
npm run preview
```

Para desenvolvimento: `npm run dev`.

## Controles

- **W/S** ou **Setas**: acelerar / ré
- **A/D** ou **Setas**: direção
- **Espaço**: freio de mão (diminui aderência traseira)
- **E**: sair do veículo
- **F**: entrar em veículo próximo
- **C**: trocar para o próximo carro (modo demo)
- **Controle**: gatilhos/analógico; A freio de mão, Y sair, X entrar

## Correções desta versão

- Evita erros TypeScript que impediam a geração do pacote Vite.
- Atualiza o raycast das rodas do carro do jogador em cada passo da física (antes não atualizava).
- Permite dar ré sem frear simultaneamente todas as rodas.
- Corrige a troca de carros pelo teclado.
- Evita teclas presas quando a janela perde foco e impede rolagem com setas/espaço.
- Configura publicação via GitHub Actions, caminhos `/wellman/` e arquivo `.nojekyll`.

Esta entrega foi montada **a partir do ZIP `wellman-main.zip` enviado pelo usuário**, que é mais antigo que o código atualmente visível no repositório online. Não contém sistemas de tiros ou inimigos que não existiam nesse ZIP. Faça backup do repositório remoto antes de substituir o conteúdo.
