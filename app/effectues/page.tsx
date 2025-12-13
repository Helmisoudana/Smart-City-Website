"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import type { Effectue, Vehicule, Trajet } from "@/types"
import { PageHeader } from "@/components/ui/page-header"
import { DataTable } from "@/components/ui/data-table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { Car, Route } from "lucide-react"

export default function EffectuesPage() {
  const [effectues, setEffectues] = useState<Effectue[]>([])
  const [vehicules, setVehicules] = useState<Vehicule[]>([])
  const [trajets, setTrajets] = useState<Trajet[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<Effectue | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    immatriculation: "",
    id_trajet: "",
    date_execution: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [effRes, vehRes, trajRes] = await Promise.all([
        api.get("/effectues"),
        api.get("/vehicules"),
        api.get("/trajets"),
      ])
      setEffectues(effRes.data)
      setVehicules(vehRes.data)
      setTrajets(trajRes.data)
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de charger les effectués", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const payload = {
        immatriculation: formData.immatriculation,
        id_trajet: Number(formData.id_trajet),
        date_execution: formData.date_execution,
      }
      await api.post("/effectues", payload)
      toast({ title: "Succès", description: "Effectué créé avec succès" })
      setCreateOpen(false)
      setFormData({ immatriculation: "", id_trajet: "", date_execution: "" })
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
      await api.delete(`/effectues/${deleteItem.immatriculation}/${deleteItem.id_trajet}`)
      toast({ title: "Succès", description: "Effectué supprimé" })
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

  const getTrajetInfo = (id: number) => {
    const traj = trajets.find((t) => t.id_trajet === id)
    return traj ? `${traj.origine} → ${traj.destination}` : "-"
  }

  const columns = [
    {
      key: "immatriculation",
      label: "Véhicule",
      render: (item: Effectue) => (
        <span className="flex items-center gap-2 font-mono">
          <Car className="h-4 w-4 text-muted-foreground" />
          {item.immatriculation}
        </span>
      ),
    },
    {
      key: "id_trajet",
      label: "Trajet",
      render: (item: Effectue) => (
        <span className="flex items-center gap-2">
          <Route className="h-4 w-4 text-blue-500" />
          {getTrajetInfo(item.id_trajet)}
        </span>
      ),
    },
    {
      key: "date_execution",
      label: "Date d'exécution",
      render: (item: Effectue) => new Date(item.date_execution).toLocaleString(),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Trajets Effectués"
        description="Historique des trajets effectués par les véhicules"
        action={{ label: "Ajouter", onClick: () => setCreateOpen(true) }}
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <DataTable
          data={effectues}
          columns={columns}
          loading={loading}
          onDelete={setDeleteItem}
          keyExtractor={(item) => `${item.immatriculation}-${item.id_trajet}`}
        />
      </motion.div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau trajet effectué</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Véhicule *</Label>
              <Select
                value={formData.immatriculation}
                onValueChange={(v) => setFormData({ ...formData, immatriculation: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un véhicule" />
                </SelectTrigger>
                <SelectContent>
                  {vehicules.map((veh) => (
                    <SelectItem key={veh.immatriculation} value={veh.immatriculation}>
                      {veh.immatriculation} - {veh.type_vehicule}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Trajet *</Label>
              <Select value={formData.id_trajet} onValueChange={(v) => setFormData({ ...formData, id_trajet: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un trajet" />
                </SelectTrigger>
                <SelectContent>
                  {trajets.map((traj) => (
                    <SelectItem key={traj.id_trajet} value={String(traj.id_trajet)}>
                      {traj.origine} → {traj.destination}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date d'exécution *</Label>
              <Input
                type="datetime-local"
                value={formData.date_execution}
                onChange={(e) => setFormData({ ...formData, date_execution: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.immatriculation || !formData.id_trajet || !formData.date_execution}
            >
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteItem}
        onOpenChange={() => setDeleteItem(null)}
        title="Supprimer le trajet effectué"
        description={`Êtes-vous sûr de vouloir supprimer cet enregistrement ?`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
