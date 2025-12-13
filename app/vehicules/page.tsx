"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import type { Vehicule } from "@/types"
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
import { Car, Zap, Fuel, Leaf } from "lucide-react"

const energieIcons: Record<string, typeof Zap> = {
  electrique: Zap,
  essence: Fuel,
  diesel: Fuel,
  hybride: Leaf,
}

export default function VehiculesPage() {
  const [vehicules, setVehicules] = useState<Vehicule[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<Vehicule | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    immatriculation: "",
    type_vehicule: "",
    energie_utilisee: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await api.get("/vehicules")
      setVehicules(res.data)
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de charger les véhicules", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      await api.post("/vehicules", formData)
      toast({ title: "Succès", description: "Véhicule créé avec succès" })
      setCreateOpen(false)
      setFormData({ immatriculation: "", type_vehicule: "", energie_utilisee: "" })
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
      await api.delete(`/vehicules/${deleteItem.immatriculation}`)
      toast({ title: "Succès", description: "Véhicule supprimé" })
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
    {
      key: "immatriculation",
      label: "Immatriculation",
      render: (item: Vehicule) => <span className="font-mono font-medium">{item.immatriculation}</span>,
    },
    {
      key: "type_vehicule",
      label: "Type",
      render: (item: Vehicule) => (
        <span className="flex items-center gap-2">
          <Car className="h-4 w-4 text-muted-foreground" />
          {item.type_vehicule}
        </span>
      ),
    },
    {
      key: "energie_utilisee",
      label: "Énergie",
      render: (item: Vehicule) => {
        const Icon = energieIcons[item.energie_utilisee.toLowerCase()] || Fuel
        const colorClass =
          item.energie_utilisee.toLowerCase() === "electrique"
            ? "text-blue-500"
            : item.energie_utilisee.toLowerCase() === "hybride"
              ? "text-green-500"
              : "text-orange-500"
        return (
          <span className={`flex items-center gap-2 ${colorClass}`}>
            <Icon className="h-4 w-4" />
            {item.energie_utilisee}
          </span>
        )
      },
    },
  ]

  return (
    <div>
      <PageHeader
        title="Véhicules"
        description="Gestion de la flotte de véhicules"
        action={{ label: "Ajouter", onClick: () => setCreateOpen(true) }}
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <DataTable
          data={vehicules}
          columns={columns}
          loading={loading}
          onDelete={setDeleteItem}
          keyExtractor={(item) => item.immatriculation}
        />
      </motion.div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau véhicule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Immatriculation *</Label>
              <Input
                value={formData.immatriculation}
                onChange={(e) => setFormData({ ...formData, immatriculation: e.target.value.toUpperCase() })}
                placeholder="Ex: AB-123-CD"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>Type de véhicule *</Label>
              <Input
                value={formData.type_vehicule}
                onChange={(e) => setFormData({ ...formData, type_vehicule: e.target.value })}
                placeholder="Ex: Voiture, Bus, Vélo"
              />
            </div>
            <div className="space-y-2">
              <Label>Énergie utilisée *</Label>
              <Select
                value={formData.energie_utilisee}
                onValueChange={(v) => setFormData({ ...formData, energie_utilisee: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electrique">Électrique</SelectItem>
                  <SelectItem value="essence">Essence</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="hybride">Hybride</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.immatriculation || !formData.type_vehicule || !formData.energie_utilisee}
            >
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteItem}
        onOpenChange={() => setDeleteItem(null)}
        title="Supprimer le véhicule"
        description={`Êtes-vous sûr de vouloir supprimer le véhicule "${deleteItem?.immatriculation}" ?`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
