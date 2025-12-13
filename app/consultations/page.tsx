"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import type { Consultation, Arrondissement } from "@/types"
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

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [arrondissements, setArrondissements] = useState<Arrondissement[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<Consultation | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    date_consultation: "",
    titre: "",
    id_arrondissement: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [conRes, arrRes] = await Promise.all([api.get("/consultations"), api.get("/arrondissements")])
      setConsultations(conRes.data)
      setArrondissements(arrRes.data)
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de charger les consultations", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const payload = {
        ...formData,
        id_arrondissement: formData.id_arrondissement ? Number(formData.id_arrondissement) : null,
      }
      await api.post("/consultations", payload)
      toast({ title: "Succès", description: "Consultation créée avec succès" })
      setCreateOpen(false)
      setFormData({ date_consultation: "", titre: "", id_arrondissement: "" })
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
      await api.delete(`/consultations/${deleteItem.id_consultation}`)
      toast({ title: "Succès", description: "Consultation supprimée" })
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

  const getArrondissementName = (id: number | undefined) => {
    if (!id) return "-"
    const arr = arrondissements.find((a) => a.id_arrondissement === id)
    return arr?.nom_arrondissement || "-"
  }

  const columns = [
    { key: "id_consultation", label: "ID" },
    { key: "titre", label: "Titre" },
    {
      key: "date_consultation",
      label: "Date",
      render: (item: Consultation) => new Date(item.date_consultation).toLocaleString(),
    },
    {
      key: "id_arrondissement",
      label: "Arrondissement",
      render: (item: Consultation) => getArrondissementName(item.id_arrondissement),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Consultations"
        description="Consultations publiques de la ville"
        action={{ label: "Ajouter", onClick: () => setCreateOpen(true) }}
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <DataTable
          data={consultations}
          columns={columns}
          loading={loading}
          onDelete={setDeleteItem}
          keyExtractor={(item) => item.id_consultation}
        />
      </motion.div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle consultation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Titre *</Label>
              <Input
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                placeholder="Titre de la consultation"
              />
            </div>
            <div className="space-y-2">
              <Label>Date/Heure *</Label>
              <Input
                type="datetime-local"
                value={formData.date_consultation}
                onChange={(e) => setFormData({ ...formData, date_consultation: e.target.value })}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={!formData.titre || !formData.date_consultation}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteItem}
        onOpenChange={() => setDeleteItem(null)}
        title="Supprimer la consultation"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteItem?.titre}" ?`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
