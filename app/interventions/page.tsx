"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import type { Intervention, Capteur, Technicien, InterventionPredictive } from "@/types"
import { PageHeader } from "@/components/ui/page-header"
import { DataTable } from "@/components/ui/data-table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { motion } from "framer-motion"
import { AlertTriangle, CheckCircle2, XCircle, Brain } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function InterventionsPage() {
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [capteurs, setCapteurs] = useState<Capteur[]>([])
  const [techniciens, setTechniciens] = useState<Technicien[]>([])
  const [predictives, setPredictives] = useState<InterventionPredictive[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<Intervention | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    date_intervention: "",
    nature_intervention: "",
    duree: "",
    cout: "",
    impact_environnemental: "",
    validation_ia: false,
    id_capteur: "",
    id_technicien_intervient: "",
    id_technicien_valide: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [intRes, capRes, techRes, predRes] = await Promise.all([
        api.get("/interventions"),
        api.get("/capteurs"),
        api.get("/techniciens"),
        api.get("/interventions-predictives"),
      ])
      setInterventions(intRes.data)
      setCapteurs(capRes.data)
      setTechniciens(techRes.data)
      setPredictives(predRes.data)
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de charger les interventions", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const payload = {
        date_intervention: formData.date_intervention,
        nature_intervention: formData.nature_intervention,
        duree: Number(formData.duree),
        cout: Number(formData.cout),
        impact_environnemental: formData.impact_environnemental ? Number(formData.impact_environnemental) : null,
        validation_ia: formData.validation_ia,
        id_capteur: formData.id_capteur,
        id_technicien_intervient: formData.id_technicien_intervient ? Number(formData.id_technicien_intervient) : null,
        id_technicien_valide: formData.id_technicien_valide ? Number(formData.id_technicien_valide) : null,
      }
      await api.post("/interventions", payload)
      toast({ title: "Succès", description: "Intervention créée avec succès" })
      setCreateOpen(false)
      setFormData({
        date_intervention: "",
        nature_intervention: "",
        duree: "",
        cout: "",
        impact_environnemental: "",
        validation_ia: false,
        id_capteur: "",
        id_technicien_intervient: "",
        id_technicien_valide: "",
      })
      fetchData()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.response?.data?.detail || "Erreur lors de la création",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    try {
      setDeleting(true)
      await api.delete(`/interventions/${deleteItem.id_intervention}`)
      toast({ title: "Succès", description: "Intervention supprimée" })
      setDeleteItem(null)
      fetchData()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.response?.data?.detail || "Erreur lors de la suppression",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const getTechnicienName = (id: number | undefined) => {
    if (!id) return "-"
    const tech = techniciens.find((t) => t.id_technicien === id)
    return tech ? `${tech.prenom} ${tech.nom}` : "-"
  }

  const columns = [
    { key: "id_intervention", label: "ID" },
    {
      key: "date_intervention",
      label: "Date",
      render: (item: Intervention) => new Date(item.date_intervention).toLocaleString(),
    },
    { key: "nature_intervention", label: "Nature" },
    { key: "duree", label: "Durée (h)" },
    { key: "cout", label: "Coût (€)", render: (item: Intervention) => item.cout.toLocaleString() + " €" },
    {
      key: "validation_ia",
      label: "IA",
      render: (item: Intervention) =>
        item.validation_ia ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <XCircle className="h-5 w-5 text-muted-foreground" />
        ),
    },
    {
      key: "id_technicien_intervient",
      label: "Technicien",
      render: (item: Intervention) => getTechnicienName(item.id_technicien_intervient),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Interventions"
        description="Gestion des interventions de maintenance"
        action={{ label: "Ajouter", onClick: () => setCreateOpen(true) }}
      />

      {/* Predictive Analytics */}
      {predictives.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Interventions Prédictives (IA)
              </CardTitle>
              <CardDescription>Pannes anticipées par l'intelligence artificielle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {predictives.slice(0, 6).map((pred, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Capteur: {pred.id_capteur.slice(0, 8)}...</span>
                      <AlertTriangle
                        className={`h-4 w-4 ${pred.probabilite_panne > 0.7 ? "text-red-500" : "text-yellow-500"}`}
                      />
                    </div>
                    <Progress value={pred.probabilite_panne * 100} className="h-2 mb-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Probabilité: {(pred.probabilite_panne * 100).toFixed(0)}%</span>
                      <span>Prévu: {new Date(pred.date_predite).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <DataTable
        data={interventions}
        columns={columns}
        loading={loading}
        onDelete={setDeleteItem}
        keyExtractor={(item) => item.id_intervention}
      />

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouvelle intervention</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Date/Heure *</Label>
              <Input
                type="datetime-local"
                value={formData.date_intervention}
                onChange={(e) => setFormData({ ...formData, date_intervention: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Nature de l'intervention *</Label>
              <Input
                value={formData.nature_intervention}
                onChange={(e) => setFormData({ ...formData, nature_intervention: e.target.value })}
                placeholder="Ex: Maintenance préventive"
              />
            </div>
            <div className="space-y-2">
              <Label>Capteur *</Label>
              <Select value={formData.id_capteur} onValueChange={(v) => setFormData({ ...formData, id_capteur: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un capteur" />
                </SelectTrigger>
                <SelectContent>
                  {capteurs.map((cap) => (
                    <SelectItem key={cap.id_capteur} value={cap.id_capteur}>
                      {cap.type_capteur} ({cap.id_capteur.slice(0, 8)}...)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Durée (heures) *</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.duree}
                  onChange={(e) => setFormData({ ...formData, duree: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Coût (€) *</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.cout}
                  onChange={(e) => setFormData({ ...formData, cout: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Impact environnemental</Label>
              <Input
                type="number"
                value={formData.impact_environnemental}
                onChange={(e) => setFormData({ ...formData, impact_environnemental: e.target.value })}
                placeholder="Score d'impact"
              />
            </div>
            <div className="space-y-2">
              <Label>Technicien intervenant</Label>
              <Select
                value={formData.id_technicien_intervient}
                onValueChange={(v) => setFormData({ ...formData, id_technicien_intervient: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {techniciens.map((tech) => (
                    <SelectItem key={tech.id_technicien} value={String(tech.id_technicien)}>
                      {tech.prenom} {tech.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Technicien validateur</Label>
              <Select
                value={formData.id_technicien_valide}
                onValueChange={(v) => setFormData({ ...formData, id_technicien_valide: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {techniciens.map((tech) => (
                    <SelectItem key={tech.id_technicien} value={String(tech.id_technicien)}>
                      {tech.prenom} {tech.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="validation_ia">Validation IA</Label>
              <Switch
                id="validation_ia"
                checked={formData.validation_ia}
                onCheckedChange={(checked) => setFormData({ ...formData, validation_ia: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                !formData.date_intervention ||
                !formData.nature_intervention ||
                !formData.id_capteur ||
                !formData.duree ||
                !formData.cout
              }
            >
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteItem}
        onOpenChange={() => setDeleteItem(null)}
        title="Supprimer l'intervention"
        description={`Êtes-vous sûr de vouloir supprimer cette intervention (${deleteItem?.nature_intervention}) ?`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
