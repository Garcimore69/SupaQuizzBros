"""Fabrique des sources (Wikipédia ou page web) pour la banque de questions."""
from urllib.parse import quote

def wp(titre, lang="fr"):
    """Source Wikipédia à partir du titre exact de l'article."""
    url = (f"https://{lang}.wikipedia.org/w/index.php?title="
           f"{quote('Spécial:Recherche' if lang == 'fr' else 'Special:Search')}"
           f"&go=Go&search={quote(titre)}")
    nom = "Wikipédia" if lang == "fr" else "Wikipédia (en anglais)"
    return {"titre": f"{nom}, « {titre} »", "url": url}

def web(titre, url):
    return {"titre": titre, "url": url}

