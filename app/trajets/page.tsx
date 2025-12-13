"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import type { Trajet, Arrondissement, TrajetEconomique } from "@/types"
import { PageHeader } from "@/components/ui/page-header"
import { DataTable } from "@/components/ui/data-table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"
import { Leaf, Clock, MapPin } from "lucide-react"

export default function TrajetsPage() {
  const [trajets, setTrajets] = useState<Trajet[]>([])
  const [arrondissements, setArrondissements] = useState<Arrondissement[]>([])
  const [trajetsEco, setTrajetsEco] = useState<TrajetEconomique[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<Trajet | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    id_arrondissement_depart: "",
    id_arrondissement_arrivee: "",
    economie_co2: "",
    duree: "",
    date_depart: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [trajRes, arrRes, ecoRes] = await Promise.all([
        api.get("/trajets"),
        api.get("/arrondissements"),
        api.get("/trajets-plus-economiques"),
      ])
      setTrajets(trajRes.data)
      setArrondissements(arrRes.data)
      setTrajetsEco(ecoRes.data)
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de charger les trajets", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (datetime: string) => {
    if (!datetime) return null
    const [date, time] = datetime.split("T")
    return `${date} ${time}:00`
  }

  const handleCreate = async () => {
    try {
      const payload = {
        id_arrondissement_depart: Number(formData.id_arrondissement_depart),
        id_arrondissement_arrivee: Number(formData.id_arrondissement_arrivee),
        economie_co2: parseFloat(formData.economie_co2),
        duree: Number(formData.duree) || 30,
        date_depart: formatDate(formData.date_depart),
      }

      await api.post("/trajets", payload)
      toast({ title: "Succès", description: "Trajet créé avec succès" })
      setCreateOpen(false)
      setFormData({
        id_arrondissement_depart: "",
        id_arrondissement_arrivee: "",
        economie_co2: "",
        duree: "",
        date_depart: "",
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
      await api.delete(`/trajets/${deleteItem.id_trajet}`)
      toast({ title: "Succès", description: "Trajet supprimé" })
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

  const columns = [
    { key: "id_trajet", label: "ID" },
    {
      key: "id_arrondissement_depart",
      label: "Départ",
      render: (item: Trajet) => (
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3 text-green-500" />
          {item.id_arrondissement_depart}
        </span>
      ),
    },
    {
      key: "id_arrondissement_arrivee",
      label: "Arrivée",
      render: (item: Trajet) => (
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3 text-red-500" />
          {item.id_arrondissement_arrivee}
        </span>
      ),
    },
    {
      key: "duree",
      label: "Durée",
      render: (item: Trajet) => (
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          {item.duree} min
        </span>
      ),
    },
    {
      key: "economie_co2",
      label: "CO2 économisé",
      render: (item: Trajet) => (
        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
          <Leaf className="h-3 w-3" />
          {item.economie_co2} kg
        </span>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Trajets"
        description="Gestion des trajets de la ville"
        action={{ label: "Ajouter", onClick: () => setCreateOpen(true) }}
      />

      {/* CO2 Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-500" />
              Trajets les plus économiques en CO2
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={trajetsEco}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="id_arrondissement_depart" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                  }}
                  formatter={(value: number) => [`${value} kg`, "CO2 économisé"]}
                />
                <Bar dataKey="economie_co2" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <DataTable
        data={trajets}
        columns={columns}
        loading={loading}
        onDelete={setDeleteItem}
        keyExtractor={(item) => item.id_trajet}
      />

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouveau trajet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Arrondissement départ *</Label>
                <Select
                  value={formData.id_arrondissement_depart}
                  onValueChange={(v) => setFormData({ ...formData, id_arrondissement_depart: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {arrondissements.map((arr) => (
                      <SelectItem key={arr.id_arrondissement} value={String(arr.id_arrondissement)}>
                        {arr.nom_arrondissement}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Arrondissement arrivée *</Label>
                <Select
                  value={formData.id_arrondissement_arrivee}
                  onValueChange={(v) => setFormData({ ...formData, id_arrondissement_arrivee: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {arrondissements.map((arr) => (
                      <SelectItem key={arr.id_arrondissement} value={String(arr.id_arrondissement)}>
                        {arr.nom_arrondissement}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Durée (minutes) *</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.duree}
                  onChange={(e) => setFormData({ ...formData, duree: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Économie CO2 (kg) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.economie_co2}
                  onChange={(e) => setFormData({ ...formData, economie_co2: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date de départ *</Label>
              <Input
                type="datetime-local"
                value={formData.date_depart}
                onChange={(e) => setFormData({ ...formData, date_depart: e.target.value })}
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
                !formData.id_arrondissement_depart ||
                !formData.id_arrondissement_arrivee ||
                !formData.duree ||
                !formData.economie_co2 ||
                !formData.date_depart
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
        title="Supprimer le trajet"
        description={`Êtes-vous sûr de vouloir supprimer le trajet "${deleteItem?.id_arrondissement_depart} → ${deleteItem?.id_arrondissement_arrivee}" ?`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
