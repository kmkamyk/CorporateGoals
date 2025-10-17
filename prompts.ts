export const ASSIGNMENT_PROMPT_TEMPLATE = `Jesteś skrupulatnym analitykiem ds. wydajności, specjalizującym się w ocenach pracowniczych. Twoim zadaniem jest przeanalizowanie poniższej listy ukończonych zadań z JIRA i zidentyfikowanie WSZYSTKICH zadań, które bezpośrednio przyczyniają się do osiągnięcia JEDNEGO, konkretnego celu rocznego.

Cel roczny do analizy:
"{{goal}}"

Oto PEŁNA lista zadań z JIRA do analizy:
{{tasks}}

Przed wygenerowaniem odpowiedzi, MUSISZ przestrzegać następujących zasad:
1.  **Kompletność:** Twoim priorytetem jest znalezienie KAŻDEGO zadania, które pasuje do celu. Przejrzyj listę od początku do końca. Nie zatrzymuj się po znalezieniu pierwszego pasującego elementu. Błędne jest zwrócenie tylko jednego zadania, jeśli więcej z nich pasuje. Twoja analiza musi być wyczerpująca.
2.  **Trafność:** Do wyniku dodawaj tylko te zadania, które mają wyraźny i bezpośredni związek z celem. Jeśli zadanie jest tylko luźno powiązane, zignoruj je.
3.  **Podsumowanie Kontekstowe:** Dla każdego zidentyfikowanego zadania napisz zwięzłe, 2-3 zdaniowe podsumowanie w języku polskim, wyjaśniające, *jak* to zadanie przyczyniło się do realizacji celu.
4.  **Format JSON:** Zwróć wynik wyłącznie w formacie JSON, będący tablicą obiektów. Każdy obiekt musi zawierać klucze "taskId" i "contextualSummary". Jeśli żadne zadanie nie pasuje, zwróć pustą tablicę [].

Twój ostateczny wynik musi zawierać wyłącznie tablicę JSON, bez żadnego innego tekstu przed lub po niej. Przykład formatu wyniku dla DWÓCH pasujących zadań:
[
  {
    "taskId": "PROJ-123",
    "contextualSummary": "Implementacja nowego przepływu uwierzytelniania użytkowników bezpośrednio przyczyniła się do zwiększenia bezpieczeństwa platformy, co było kluczowym elementem celu poprawy wydajności i niezawodności aplikacji."
  },
  {
    "taskId": "PROJ-456",
    "contextualSummary": "Optymalizacja zapytań do bazy danych skróciła czas ładowania raportów o 15%, co jest zgodne z celem zwiększenia ogólnej wydajności aplikacji."
  }
]`;

export const SUMMARY_PROMPT_TEMPLATE = `Jesteś ekspertem w pisaniu firmowych ocen pracowniczych. Twoim zadaniem jest zsyntetyzowanie zbioru podsumowań zadań w spójne, dwuakapitowe podsumowanie roczne dla określonego celu. Pisz w języku polskim.

Cel Roczny brzmi: "{{goal}}"

Oto kluczowe osiągnięcia i wkłady w realizację tego celu w ciągu roku, oparte na zrealizowanych zadaniach:
{{summaries}}

Na podstawie powyższych informacji napisz przekonujące, profesjonalne, dwuakapitowe podsumowanie w języku polskim.
- Pierwszy akapit powinien przedstawiać ogólny zarys postępów i kluczowych osiągnięć związanych z celem.
- Drugi akapit powinien szczegółowo opisać wpływ tych działań, podkreślając wykazane umiejętności i wartość wniesioną do firmy.
- Ton powinien być pozytywny i profesjonalny.
- Nie ograniczaj się do wymieniania zadań. Zsyntetyzuj je w płynną narrację.
- Wynik powinien zawierać wyłącznie dwa akapity tekstu.`;