# Android TV Streaming Hub (Google TV / Android TV)

Hub de Streaming profissional para **Google TV** e **Android TV** desenvolvido com **Jetpack Compose for TV**, **AndroidX Media3 (ExoPlayer)**, **Retrofit**, **Kotlinx Serialization** e **Coil**.

---

## 🚀 Requisitos e Tecnologias
- **Android Studio**: Ladybug / Koala ou superior (com JDK 17).
- **Kotlin**: 2.0.20
- **Compile SDK**: 35 | **Min SDK**: 26 (Android 8.0 Oreo)
- **UI**: Jetpack Compose for TV (`TvLazyColumn` e `TvLazyRow` com foco D-Pad nativo)
- **Player**: AndroidX Media3 ExoPlayer 1.5.0 (suporte a HLS `.m3u8`, DASH `.mpd` e MP4 com autoplay)
- **Networking**: Retrofit 2.11 + OkHttp 4.12 + Kotlinx Serialization 1.7
- **Imagens**: Coil 2.7.0

---

## 🛠️ Como abrir e rodar no Android Studio

1. Baixe o projeto ZIP através deste estúdio ou extraia os arquivos na pasta desejada.
2. Abra o **Android Studio** e clique em **File > Open**, selecionando o diretório raiz.
3. Aguarde o **Gradle Sync** terminar de baixar os artefatos.
4. Crie um dispositivo virtual no **Device Manager**:
   - Selecione a categoria **TV**.
   - Escolha o perfil **Android TV (1080p)** ou **Google TV (4K)**.
   - Selecione a imagem de sistema **Android 14 (API 34)** ou **Android 13**.
5. Clique em **Run 'app'** (`Shift + F10`).

---

## 🎮 Controles no Emulador ou Controle Físico (D-Pad)
- **Setas do Teclado (Cima / Baixo / Esquerda / Direita)**: Navegação entre categorias e cards horizontais.
- **Enter / Botão Central (D-Pad Center)**: Seleciona o card e abre o player com autoplay imediato.
- **Escape / Back (Voltar)**: Retorna do player para o catálogo ou sai do aplicativo.
