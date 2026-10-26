# Assets reais do Wellman — licença e procedência

Esta revisão substitui carros/veículos, personagem e elementos urbanos primitivos por 15 modelos 3D GLB reais. Os arquivos estão incluídos no próprio repositório em `public/models/`, sem dependências externas em tempo de jogo.

**Autor original:** Kenney (https://kenney.nl)
**Licença:** Creative Commons CC0 1.0 Universal (https://creativecommons.org/publicdomain/zero/1.0/)
**Fonte dos modelos:** https://kenney.nl/assets/car-kit
- https://kenney.nl/assets/city-kit-roads
- https://kenney.nl/assets/city-kit-commercial
- https://kenney.nl/assets/city-kit-suburban
- https://kenney.nl/assets/mini-characters

**Distribuição GLB reempacotada do material CC0 de Kenney:** https://github.com/Hidencod/tge-assets
Os modelos são inclusos localmente para carregamento no GitHub Pages.

## Modelos incluídos
- Veículos: sedan, sedan-sports, hatchback-sports, SUV, polícia e táxi.
- Personagem: character-male-a.
- Objetos: barreira de obra, cone, placa PARE, iluminação pública e contêiner de lixo.
- Cidade: loja, prédio comercial e árvore.

O sistema `src/visuals/realAssets.ts` carrega GLBs com `GLTFLoader`, redimensiona ao porte dos colliders Rapier, anima os nós das rodas e monta a cidade. A geometria visual antiga só permanece como recurso de reserva em caso de erro de carregamento. Colisões e controles continuam na física do jogo.

Os modelos são CC0. Agradecimentos a Kenney, embora atribuição não seja exigida pela licença.
