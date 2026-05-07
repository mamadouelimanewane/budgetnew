# BudgetNew — Logiciel de Suivi Budgétaire Intelligent Premium

> Deux produits sur une même base de code : **Standard** (fonctions cœur) et **Premium** (IA avancée, marchés publics DCMP, simulation what-if, alertes intelligentes, géo-dashboard, multi-entités).

## Produits & Tarifs

| | Standard | Premium |
|---|:---:|:---:|
| Plans budgétaires multi-exercices | ✓ | ✓ |
| Cycle engagements → paiements | ✓ | ✓ |
| Gestion fournisseurs (NINEA validé) | ✓ | ✓ |
| Audit immuable hash-chain | ✓ | ✓ |
| RBAC 4 rôles + délégations | ✓ | ✓ |
| Export XLSX / PDF UEMOA | ✓ | ✓ |
| Multilingue Fr / Wolof / En | ✓ | ✓ |
| IA Forecasting (régression) | ✓ | ✓ |
| **Marchés Publics DCMP** | — | ✓ |
| **Simulation What-If budgétaire** | — | ✓ |
| **Alertes intelligentes multi-canaux** | — | ✓ |
| **Géo-tableau de bord 14 régions SN** | — | ✓ |
| **Multi-entités & consolidation** | — | ✓ |
| **Commentaires & collaboration** | — | ✓ |
| **Export TOFE BCEAO** | — | ✓ |
| **Support SLA 24/7** | — | ✓ |
| **Prix / mois** | **150 000 FCFA** | **500 000 FCFA** |

## Démarrage

```bash
docker compose up --build
# Frontend : http://localhost:5173
# API Swagger : http://localhost:8000/docs
# Login demo : admin@budget.local / Admin123!
```

## Activer Premium

```bash
curl -X POST "http://localhost:8000/premium/license/activate?plan=premium&org_name=DGF" \
  -H "Authorization: Bearer <token>"
```

Ou via l'interface : Plans & Licence → Passer au Premium.

## Architecture Premium (ajouts sur Budget1)

- `backend/app/models_premium.py` — 6 nouveaux modèles
- `backend/app/routers/dcmp.py` — Marchés Publics DCMP
- `backend/app/routers/simulation.py` — Simulation What-If
- `backend/app/routers/alerts.py` — Alertes intelligentes
- `backend/app/routers/collaboration.py` — Commentaires
- `backend/app/routers/geo.py` — Géo-dashboard + multi-entités
- `backend/app/routers/license.py` — Gestion plan Standard/Premium
- `frontend/src/ui/pages/DcmpPage.tsx`
- `frontend/src/ui/pages/SimulationPage.tsx`
- `frontend/src/ui/pages/AlertsPage.tsx`
- `frontend/src/ui/pages/LicensePage.tsx`
