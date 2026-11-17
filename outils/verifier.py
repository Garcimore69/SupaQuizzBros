"""Contrôles qualité automatiques de la banque de questions.

Appelé par generer_banque.py : la banque n'est pas écrite si un contrôle échoue.
"""
from collections import Counter

# Réponses trop courantes pour constituer un indice (« Nintendo » apparaît partout).
INDICES_TOLERES = {"nintendo", "microsoft", "playstation", "capcom", "konami",
                   "ubisoft", "france", "donkey kong", "adventure"}


def verifier(questions):
    """Renvoie la liste des problèmes bloquants (liste vide = banque valide)."""
    pb = []
    ids = Counter(q["id"] for q in questions)
    pb += [f"Identifiant en double : {i}" for i, n in ids.items() if n > 1]
    enonces = Counter(q["enonce"] for q in questions)
    pb += [f"Énoncé en double : {e}" for e, n in enonces.items() if n > 1]
    for q in questions:
        bonne = q["choix"][q["bonne"]]
        if len({c.lower() for c in q["choix"]}) != 4:
            pb.append(f"{q['id']} : les 4 propositions doivent être distinctes")
        if bonne.lower() in q["enonce"].lower():
            pb.append(f"{q['id']} : la bonne réponse figure dans l'énoncé")
        if not q["source"]["url"].startswith("https://"):
            pb.append(f"{q['id']} : la source doit être un lien https")
        if len(q["explication"]) > 230:
            pb.append(f"{q['id']} : explication trop longue (230 caractères max)")
    # Une explication ne doit pas souffler la réponse d'une autre question du même niveau
    for a in questions:
        for b in questions:
            if a is b or a["niveau"] != b["niveau"]:
                continue
            rep = b["choix"][b["bonne"]].lower()
            if (len(rep) > 5 and rep not in INDICES_TOLERES
                    and rep in a["explication"].lower() and rep not in b["enonce"].lower()):
                pb.append(f"{a['id']} : l'explication souffle la réponse de {b['id']} (« {rep} »)")
    return pb
