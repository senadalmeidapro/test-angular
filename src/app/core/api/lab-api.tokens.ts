// [Angular — Imports Angular] `InjectionToken`
// Contexte : l’URL de l’API est une dépendance configurable propre au laboratoire.
// Objectif : importer la primitive Angular qui permet de déclarer une clé d’injection.
// Justification : le token fournit un contrat explicite sans imposer une classe de configuration.
import { InjectionToken } from '@angular/core';

// [Angular — Injection de dépendances] `new InjectionToken<string>(...)`
// Contexte : les clients API ont besoin de la même URL sans la coder en dur.
// Objectif : créer puis exporter une clé d’injection dont la valeur est fortement typée comme `string`.
// Justification : le type est vérifié à l’injection, tandis que la chaîne sert seulement à identifier le token.
export const LAB_API_URL = new InjectionToken<string>('LAB_API_URL');
