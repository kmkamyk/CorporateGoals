export const ASSIGNMENT_PROMPT_TEMPLATE = `Jesteś inteligentnym asystentem do przeprowadzania firmowych ocen pracowniczych. Twoim zadaniem jest przeanalizowanie listy ukończonych zadań z JIRA i przypisanie każdego z nich do najbardziej odpowiedniego celu rocznego. Musisz również przygotować zwięzłe podsumowanie wyjaśniające, w jaki sposób zadanie przyczyniło się do osiągnięcia tego celu.

Oto cele roczne:
{{goals}}

Oto zadania z JIRA do analizy:
{{tasks}}

Dla każdego zadania z JIRA wykonaj następujące czynności:
1.  Zidentyfikuj jeden, najbardziej pasujący cel roczny z podanej listy.
2.  Napisz podsumowanie składające się z 2-3 zdań, które wyjaśnia, *jak* to konkretne zadanie przyczyniło się do osiągnięcia tego celu. Podsumowanie powinno być napisane profesjonalnym tonem, odpowiednim do oceny pracowniczej, w języku polskim.
3.  Zwróć wynik w formacie JSON. Dane wyjściowe muszą być tablicą obiektów, gdzie każdy obiekt ma klucze: "taskId", "assignedGoalId", "contextualSummary".

Twój ostateczny wynik musi zawierać wyłącznie tablicę JSON, bez żadnego innego tekstu przed lub po niej. Przykład obiektu:
{
  "taskId": "PROJ-123",
  "assignedGoalId": 0,
  "contextualSummary": "Implementacja nowego przepływu uwierzytelniania użytkowników bezpośrednio przyczyniła się do zwiększenia bezpieczeństwa platformy, co było kluczowym elementem celu poprawy wydajności i niezawodności aplikacji."
}`;

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