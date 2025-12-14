// Smart City Platform - TypeScript Interfaces
// STRICT CONTRACT - DO NOT MODIFY FIELD NAMES

export interface Arrondissement {
  id_arrondissement: number
  nom_arrondissement: string
  type_arrondissement?: string
}

export interface Capteur {
  id_capteur: string // UUID
  type_capteur: string
  statut: string
  date_installation: string // date
  id_proprietaire?: number
  id_arrondissement?: number
}

export interface Citoyen {
  id_citoyen: number
  nom: string
  adresse?: string
  telephone?: string
  email?: string
  score_engagement: number
  preference_mobilite?: string
}

export interface Consultation {
  id_consultation: number
  date_consultation: string // datetime
  titre: string
  id_arrondissement?: number
}

export interface Participation {
  id_citoyen: number
  id_consultation: number
  date_participation: string // date
  avis?: string
}

export interface Technicien {
  id_technicien: number
  nom: string
  prenom: string
  certification: boolean
}

export interface Intervention {
  id_intervention: number
  date_intervention: string // datetime
  nature_intervention: string
  duree: number
  cout: number
  impact_environnemental?: number
  validation_ia: boolean
  id_capteur: string
  id_technicien_intervient?: number
  id_technicien_valide?: number
}

export interface Mesure {
  id_mesure: number
  date_mesure: string // datetime
  valeur: number
  unite: string
  type_mesure: string
  id_capteur: string
}

export interface Trajet {
  id_trajet: number
  origine: string
  destination: string
  duree: number
  economie_co2: number
  date_depart?: string // datetime
  date_arrivee?: string // datetime
  id_arrondissement_depart?: number
  id_arrondissement_arrivee?: number
}

export interface Vehicule {
  immatriculation: string
  type_vehicule: string
  energie_utilisee: string
}

export interface Effectue {
  immatriculation: string
  id_trajet: number
  date_execution: string // datetime
}

export interface Proprietaire {
  id_proprietaire: number
  nom: string
  type?: string
  adresse?: string
  telephone?: string
  email?: string 

}

// Analytics Types
export interface ZonePollution {
  arrondissement: string   // nom de l'arrondissement
  score_total: number      // score de pollution
}

export interface TauxDisponibilite {
  arrondissement: string
  taux_disponibilite: number
}

export interface CitoyenEngage {
  id_citoyen: number
  nom: string
  score_engagement: number
}

export interface TrajetEconomique {
  id_trajet: number
  origine: string
  destination: string
  economie_co2: number
}

export interface InterventionPredictive {
  id_capteur: string
  probabilite_panne: number
  date_predite: string
}
export interface InterventionPredictive {
  nombre_interventions: number
  economie_co2: number
}
