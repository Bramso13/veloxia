import { ComboboxItem } from "@/components/ui/combobox";

const API_URL = "https://geo.api.gouv.fr/communes";

export async function searchCities(query: string): Promise<ComboboxItem[]> {
  if (!query || query.length < 2) return [];

  try {
    const response = await fetch(
      `${API_URL}?nom=${encodeURIComponent(query)}&limit=10&fields=nom,code`
    );

    if (!response.ok) {
      throw new Error("Erreur lors de la recherche des villes");
    }

    const data = await response.json();

    return data.map((city: any) => ({
      value: city.code,
      label: city.nom,
    }));
  } catch (error) {
    console.error("Erreur lors de la recherche des villes:", error);
    return [];
  }
}
