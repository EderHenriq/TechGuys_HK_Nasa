# 💎 Prisma

### _Decompondo dados climáticos em decisões claras para seus eventos._

[![NASA Space Apps 2025](https://img.shields.io/badge/NASA%20Space%20Apps-2025-blue)](https://www.spaceappschallenge.org/)

Um projeto desenvolvido para o desafio **"Will It Rain On My Parade?"** do NASA International Space Apps Challenge 2025.

---

### Nossas Tecnologias

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![Flask](https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white)
![Pandas](https://img.shields.io/badge/pandas-%23150458.svg?style=for-the-badge&logo=pandas&logoColor=white)

---

## 🎯 O Problema

Planejar um evento ao ar livre, seja um piquenique, um casamento ou uma trilha, carrega uma grande incerteza: o clima. As previsões meteorológicas tradicionais nos dão uma estimativa para o futuro, mas não respondem a uma pergunta crucial baseada em anos de dados: **"Qual é a real probabilidade de um dia ser quente, frio ou chuvoso em uma data específica?"**. A falta de uma análise histórica acessível torna o planejamento de longo prazo um jogo de adivinhação.

## ✨ A Solução: Prisma

**Prisma** é uma aplicação web que aborda esse desafio de uma forma diferente. Em vez de prever o futuro, nós analisamos o passado para dar clareza ao seu planejamento.

Assim como um prisma decompõe a luz em suas cores constituintes, nossa aplicação decompõe um histórico de mais de uma década de dados meteorológicos para mostrar a você o comportamento climático típico para qualquer dia do ano. Com o Prisma, o usuário pode:

* **Analisar o Histórico Climático:** Inserir um dia e mês para visualizar as condições meteorológicas registradas para aquela data ao longo dos anos.
* **Obter Insights Estatísticos:** Ver rapidamente a temperatura média, a velocidade do vento e outras métricas para tomar uma decisão informada.
* **Entender a Variabilidade:** Observar como o clima variou ano a ano, entendendo se a data é consistentemente estável ou imprevisível.

## 🚀 Como Funciona

O Prisma utiliza uma arquitetura simples e robusta:

1.  **Frontend (HTML, CSS, JS):** Uma interface limpa e intuitiva onde o usuário insere a data de interesse.
2.  **Backend (API em Python):** Um microserviço desenvolvido com Flask e Pandas que consome um dataset histórico do Kaggle (`weatherHistory.csv`).
3.  **Comunicação:** O frontend faz uma chamada para a nossa API, que filtra e retorna todos os registros históricos para a data solicitada. Os dados são então processados e exibidos de forma clara para o usuário.

## 🏁 Como Rodar o Projeto Localmente

Siga os passos abaixo para testar o Prisma na sua máquina.

### Pré-requisitos

* Python 3.x
* Pip (gerenciador de pacotes do Python)

### Backend

1.  Clone o repositório:
    ```bash
    git clone [https://github.com/SEU_USUARIO/NOME_DO_SEU_REPOSITORIO.git](https://github.com/SEU_USUARIO/NOME_DO_SEU_REPOSITORIO.git)
    ```
2.  Navegue até a pasta do backend:
    ```bash
    cd NOME_DO_SEU_REPOSITORIO/pasta-do-backend
    ```
3.  Instale as dependências:
    ```bash
    pip install -r requirements.txt
    ```
    *(Dica: não se esqueça de criar um arquivo `requirements.txt` com o comando `pip freeze > requirements.txt`)*

4.  Inicie a API:
    ```bash
    python api.py
    ```
    O servidor estará rodando em `http://127.0.0.1:5000`.

### Frontend

1.  Navegue até a pasta do frontend.
2.  Abra o arquivo `index.html` diretamente no seu navegador de preferência (Google Chrome, Firefox, etc.).

E pronto! Agora você pode fazer as consultas pela interface.

## 🧑‍💻 Equipe


