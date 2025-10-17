# Corporate Goals Dashboard

## 🇵🇱 Wersja Polska

Corporate Goals Dashboard to aplikacja internetowa zaprojektowana w celu usprawnienia i automatyzacji procesu tworzenia rocznych podsumowań i ocen pracowniczych. Aplikacja wykorzystuje moc lokalnych, dużych modeli językowych (LLM) do analizy ukończonych zadań z systemu JIRA i automatycznego przypisywania ich do zdefiniowanych celów rocznych. Na tej podstawie generuje spójne, profesjonalne podsumowania, oszczędzając czas menedżerów i pracowników.

---

### Kluczowe Funkcje

*   **Automatyczne Przypisywanie Zadań:** AI analizuje listę ukończonych zadań i inteligentnie dopasowuje je do odpowiednich celów rocznych.
*   **Generowanie Podsumowań Rocznych:** Na podstawie przypisanych zadań, AI tworzy profesjonalne, dwuakapitowe podsumowania dla każdego celu, gotowe do wykorzystania w dokumentach oceniających.
*   **Wsparcie dla Lokalnych Modeli LLM:** Aplikacja integruje się z serwerami LLM działającymi lokalnie, zapewniając pełną prywatność danych. Wspiera popularne formaty API, takie jak **Ollama** i **llama.cpp**.
*   **Wiele Źródeł Danych:**
    *   **Połączenie z JIRA:** Pobieraj zadania bezpośrednio z Twojej instancji JIRA Cloud.
    *   **Dane Mockowe:** Testuj aplikację bez potrzeby łączenia z JIRA, korzystając z wbudowanego zestawu przykładowych danych.
    *   **Wprowadzanie Ręczne:** Wklej listę zadań bezpośrednio do aplikacji.
*   **Pełna Konfiguracja AI:** Użytkownicy mogą modyfikować szablony promptów używane do przypisywania zadań i generowania podsumowań, aby dostosować wyniki do specyficznych potrzeb.
*   **Podgląd Kontekstu AI w Czasie Rzeczywistym:** Podczas przetwarzania aplikacja wyświetla dokładny prompt wysyłany do modelu LLM, co pozwala na transparentność i łatwiejsze debugowanie.
*   **Streaming Odpowiedzi:** Podsumowania roczne są generowane i wyświetlane w czasie rzeczywistym (słowo po słowie), co poprawia doświadczenie użytkownika.
*   **Skrypt Wdrożeniowy:** Dołączony skrypt `install.sh` automatyzuje cały proces wdrożenia aplikacji na serwerach opartych na systemie Red Hat (RHEL, CentOS, Fedora).

### Jak to Działa?

Proces analityczny aplikacji składa się z dwóch głównych kroków, realizowanych dla każdego celu rocznego:

1.  **Krok 1: Przypisywanie Zadań (Task Assignment)**
    *   Aplikacja tworzy szczegółowy prompt, który zawiera jeden cel roczny oraz pełną listę ukończonych zadań.
    *   Prompt jest wysyłany do lokalnego LLM z instrukcją, aby zidentyfikował **wszystkie** zadania, które przyczyniły się do realizacji tego celu.
    *   AI zwraca listę pasujących zadań w formacie JSON, wraz z krótkim uzasadnieniem, dlaczego dane zadanie jest istotne.

2.  **Krok 2: Generowanie Podsumowania (Summary Generation)**
    *   Uzasadnienia z poprzedniego kroku są łączone w nowy prompt, który ponownie trafia do LLM.
    *   AI otrzymuje zadanie zsyntetyzowania tych informacji w spójne, profesjonalne, dwuakapitowe podsumowanie roczne.
    *   Wynik jest przesyłany strumieniowo z powrotem do interfejsu użytkownika.

### Instrukcja Użycia

1.  **Wprowadź Cele Roczne:** W polu "1. Moje cele roczne" wpisz swoje cele, każdy w nowej linii.
2.  **Załaduj Zadania:** W sekcji "2. Zadania z JIRA" wybierz źródło danych:
    *   **Dane Mockowe:** Kliknij, aby załadować przykładowe dane.
    *   **Połącz z JIRA:** Podaj domenę, email i token API, a następnie pobierz zadania.
    *   **Wpisz Ręcznie:** Wklej listę zadań w formacie `ID-ZADANIA: Tytuł zadania`.
3.  **(Opcjonalnie) Skonfiguruj AI:** Rozwiń sekcję "Konfiguracja AI", aby:
    *   Podać adres URL i nazwę swojego lokalnego modelu LLM.
    *   Dostosować szablony promptów.
4.  **Generuj Podsumowanie:** Kliknij przycisk "Generuj Podsumowanie Roczne", aby rozpocząć analizę.
5.  **Przeglądaj Wyniki:** Wyniki pojawią się w sekcji "3. Podsumowanie Roczne". Możesz rozwijać każdy cel, aby zobaczyć wygenerowane podsumowanie oraz listę przypisanych do niego zadań.

### Wdrożenie na Produkcji (Red Hat / CentOS / Fedora)

Dołączony skrypt `install.sh` w pełni automatyzuje proces instalacji i konfiguracji aplikacji na serwerze.

**Wymagania:**
*   Serwer z systemem operacyjnym opartym na Red Hat (np. RHEL, CentOS, Fedora).
*   Dostęp do konta z uprawnieniami `sudo`.

**Instrukcja:**
1.  Prześlij wszystkie pliki aplikacji na serwer.
2.  Nadaj skryptowi uprawnienia do wykonania:
    ```bash
    chmod +x install.sh
    ```
3.  Uruchom skrypt z uprawnieniami `sudo`:
    ```bash
    sudo ./install.sh
    ```

**Co robi skrypt?**
*   Instaluje zależności: `nginx`, `nodejs`, `npm`.
*   Buduje aplikację przy użyciu `esbuild`.
*   Konfiguruje `nginx` do serwowania aplikacji na porcie `8080`.
*   Konfiguruje zaporę sieciową (`firewalld`) oraz kontekst `SELinux`.
*   Uruchamia i włącza usługę `nginx`.

Po zakończeniu działania skryptu aplikacja będzie dostępna pod adresem `http://<IP_TWOJEGO_SERWERA>:8080`.

---
---

## 🇬🇧 English Version

The Corporate Goals Dashboard is a web application designed to streamline and automate the process of creating annual summaries and performance reviews. The application leverages the power of local Large Language Models (LLMs) to analyze completed JIRA tasks and automatically assign them to predefined annual goals. Based on this analysis, it generates coherent, professional summaries, saving valuable time for managers and employees.

---

### Key Features

*   **AI-Powered Task Assignment:** The AI analyzes a list of completed tasks and intelligently matches them to the relevant annual goals.
*   **Annual Summary Generation:** Based on the assigned tasks, the AI crafts professional, two-paragraph summaries for each goal, ready to be used in review documents.
*   **Local LLM Support:** The application integrates with locally hosted LLM servers, ensuring complete data privacy. It supports popular API formats like **Ollama** and **llama.cpp**.
*   **Multiple Data Sources:**
    *   **JIRA Connection:** Fetch tasks directly from your JIRA Cloud instance.
    *   **Mock Data:** Test the application without needing a JIRA connection using a built-in set of sample data.
    *   **Manual Input:** Paste a list of tasks directly into the application.
*   **Full AI Configuration:** Users can modify the prompt templates used for task assignment and summary generation to tailor the results to their specific needs.
*   **Real-Time AI Context Inspector:** During processing, the application displays the exact prompt being sent to the LLM, providing transparency and facilitating easier debugging.
*   **Streaming Responses:** Annual summaries are generated and displayed in real-time (word by word), enhancing the user experience.
*   **Deployment Script:** The included `install.sh` script automates the entire deployment process for the application on Red Hat-based servers (RHEL, CentOS, Fedora).

### How It Works

The application's analytical process consists of two main steps, performed for each annual goal:

1.  **Step 1: Task Assignment**
    *   The application constructs a detailed prompt containing one annual goal and the full list of completed tasks.
    *   This prompt is sent to the local LLM with instructions to identify **all** tasks that contributed to achieving that goal.
    *   The AI returns a JSON-formatted list of matching tasks, along with a brief justification for why each task is relevant.

2.  **Step 2: Summary Generation**
    *   The justifications from the previous step are combined into a new prompt, which is sent back to the LLM.
    *   The AI is tasked with synthesizing this information into a coherent, professional, two-paragraph annual summary.
    *   The result is streamed back to the user interface.

### How to Use

1.  **Enter Annual Goals:** In the "1. My Annual Goals" section, type your goals, each on a new line.
2.  **Load Tasks:** In the "2. JIRA Tasks" section, choose a data source:
    *   **Mock Data:** Click to load sample data.
    *   **Connect to JIRA:** Provide your domain, email, and API token, then fetch the tasks.
    *   **Manual Input:** Paste a list of tasks in the `TASK-ID: Task title` format.
3.  **(Optional) Configure AI:** Expand the "AI Configuration" section to:
    *   Provide the URL and model name for your local LLM.
    *   Customize the prompt templates.
4.  **Generate Summary:** Click the "Generate Annual Summary" button to start the analysis.
5.  **Review Results:** The results will appear in the "3. Annual Summary" section. You can expand each goal to see the generated summary and the list of tasks assigned to it.

### Production Deployment (Red Hat / CentOS / Fedora)

The included `install.sh` script fully automates the installation and configuration of the application on a server.

**Prerequisites:**
*   A server with a Red Hat-based operating system (e.g., RHEL, CentOS, Fedora).
*   Access to an account with `sudo` privileges.

**Instructions:**
1.  Upload all application files to the server.
2.  Make the script executable:
    ```bash
    chmod +x install.sh
    ```
3.  Run the script with `sudo` privileges:
    ```bash
    sudo ./install.sh
    ```

**What the script does:**
*   Installs dependencies: `nginx`, `nodejs`, `npm`.
*   Builds the application using `esbuild`.
*   Configures `nginx` to serve the application on port `8080`.
*   Configures the firewall (`firewalld`) and `SELinux` context.
*   Starts and enables the `nginx` service.

After the script finishes, the application will be available at `http://<YOUR_SERVER_IP>:8080`.
