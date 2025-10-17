export const ASSIGNMENT_PROMPT_TEMPLATE = `Jesteś precyzyjnym analitykiem, którego jedynym zadaniem jest dokładne i kompletne dopasowanie zadań JIRA do podanego celu rocznego.

**Cel Roczny:**
"{{goal}}"

**Instrukcja Krok po Kroku, której musisz bezwzględnie przestrzegać:**
1.  **Zrozumienie Celu:** Przeczytaj powyższy cel roczny i zidentyfikuj jego kluczowe założenia, słowa kluczowe i intencje.
2.  **Analiza Każdego Zadania:** Poniżej znajduje się pełna lista zadań. Twoim obowiązkiem jest przeanalizować **KAŻDE** zadanie z tej listy, jedno po drugim, od początku do samego końca. Dla każdego zadania zadaj sobie pytanie: "Czy to zadanie ma bezpośredni i znaczący wkład w realizację celu?".
3.  **Nie Idź na Skróty (NAJWAŻNIEJSZE):** Najczęstszym błędem jest zatrzymanie się po znalezieniu jednego lub dwóch pasujących zadań. Jest to niedopuszczalne. Twoja analiza musi objąć **CAŁĄ LISTĘ**. Musisz przeiterować po wszystkich zadaniach.
4.  **Tworzenie Listy Wyników:** W trakcie analizy, jeśli uznasz, że zadanie pasuje, dodaj je do swojej wewnętrznej listy wyników. Dla każdego takiego zadania, przygotuj zwięzłe, 1-2 zdaniowe uzasadnienie, dlaczego wnosi ono wkład w cel.
5.  **Formatowanie Ostatecznej Odpowiedzi:** Po przeanalizowaniu WSZYSTKICH zadań, sformatuj swoją kompletną listę wyników jako tablicę JSON.

**Pełna Lista Zadań do Analizy:**
{{tasks}}

**Format Wyjściowy (WYŁĄCZNIE CZYSTY JSON):**
Zwróć wynik jako tablicę obiektów JSON. Każdy obiekt musi zawierać klucze "taskId" i "contextualSummary". Jeśli absolutnie żadne zadanie nie pasuje, zwróć pustą tablicę []. Nie dodawaj żadnych wyjaśnień, komentarzy ani innego tekstu poza samą tablicą JSON.

Przykład formatu wyniku dla TRZECH pasujących zadań:
[
  {
    "taskId": "PROJ-123",
    "contextualSummary": "Zadanie to bezpośrednio przyczyniło się do celu poprzez implementację nowej funkcjonalności X, która była kluczowym wymogiem."
  },
  {
    "taskId": "PROJ-456",
    "contextualSummary": "Optymalizacja wydajności bazy danych w ramach tego zadania skróciła czas odpowiedzi systemu o 20%, co jest zgodne z celem."
  },
  {
    "taskId": "PROJ-789",
    "contextualSummary": "Wdrożenie zautomatyzowanych testów w tym zadaniu zwiększyło stabilność aplikacji, co było jednym z głównych założeń celu."
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