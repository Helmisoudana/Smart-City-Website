"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import type { Capteur, Arrondissement } from "@/types"
import { PageHeader } from "@/components/ui/page-header"
import { DataTable } from "@/components/ui/data-table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { StatusBadge } from "@/components/ui/status-badge"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"

export default function CapteursPage() {
  const [capteurs, setCapteurs] = useState<Capteur[]>([])
  const [arrondissements, setArrondissements] = useState<Arrondissement[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<Capteur | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [filterArr, setFilterArr] = useState<string>("all")
  const [formData, setFormData] = useState({
    type_capteur: "",
    statut: "actif",
    date_installation: "",
    id_proprietaire: "",
    id_arrondissement: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [capRes, arrRes] = await Promise.all([api.get("/capteurs"), api.get("/arrondissements")])
      setCapteurs(capRes.data)
      setArrondissements(arrRes.data)
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de charger les capteurs", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const payload = {
        ...formData,
        id_proprietaire: formData.id_proprietaire ? Number(formData.id_proprietaire) : null,
        id_arrondissement: formData.id_arrondissement ? Number(formData.id_arrondissement) : null,
      }
      await api.post("/capteurs", payload)
      toast({ title: "Succès", description: "Capteur créé avec succès" })
      setCreateOpen(false)
      setFormData({
        type_capteur: "",
        statut: "actif",
        date_installation: "",
        id_proprietaire: "",
        id_arrondissement: "",
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
      await api.delete(`/capteurs/${deleteItem.id_capteur}`)
      toast({ title: "Succès", description: "Capteur supprimé" })
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

  const filteredCapteurs =
    filterArr === "all" ? capteurs : capteurs.filter((c) => c.id_arrondissement === Number(filterArr))

  const columns = [
    { key: "id_capteur", label: "ID", render: (item: Capteur) => item.id_capteur.slice(0, 8) + "..." },
    { key: "type_capteur", label: "Type" },
    { key: "statut", label: "Statut", render: (item: Capteur) => <StatusBadge status={item.statut} /> },
    { key: "date_installation", label: "Installation" },
    { key: "id_arrondissement", label: "Arrondissement" },
  ]

  return (
    <div>
      <PageHeader
        title="Capteurs"
        description="Gestion des capteurs IoT de la ville"
        action={{ label: "Ajouter", onClick: () => setCreateOpen(true) }}
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <Select value={filterArr} onValueChange={setFilterArr}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filtrer par arrondissement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les arrondissements</SelectItem>
            {arrondissements.map((arr) => (
              <SelectItem key={arr.id_arrondissement} value={String(arr.id_arrondissement)}>
                {arr.nom_arrondissement}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      <DataTable
        data={filteredCapteurs}
        columns={columns}
        loading={loading}
        onDelete={setDeleteItem}
        keyExtractor={(item) => item.id_capteur}
      />

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau capteur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Type de capteur *</Label>
              <Input
                value={formData.type_capteur}
                onChange={(e) => setFormData({ ...formData, type_capteur: e.target.value })}
                placeholder="Ex: Temperature, Pollution, Bruit"
              />
            </div>
            <div className="space-y-2">
              <Label>Statut *</Label>
              <Select value={formData.statut} onValueChange={(v) => setFormData({ ...formData, statut: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="inactif">Inactif</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date d'installation *</Label>
              <Input
                type="date"
                value={formData.date_installation}
                onChange={(e) => setFormData({ ...formData, date_installation: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Arrondissement</Label>
              <Select
                value={formData.id_arrondissement}
                onValueChange={(v) => setFormData({ ...formData, id_arrondissement: v })}
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
              <Label>ID Propriétaire</Label>
              <Input
                type="number"
                value={formData.id_proprietaire}
                onChange={(e) => setFormData({ ...formData, id_proprietaire: e.target.value })}
                placeholder="Ex: 1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={!formData.type_capteur || !formData.date_installation}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteItem}
        onOpenChange={() => setDeleteItem(null)}
        title="Supprimer le capteur"
        description={`Êtes-vous sûr de vouloir supprimer ce capteur (${deleteItem?.type_capteur}) ?`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
