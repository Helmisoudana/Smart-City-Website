"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import type { Participation, Citoyen, Consultation } from "@/types"
import { PageHeader } from "@/components/ui/page-header"
import { DataTable } from "@/components/ui/data-table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"

export default function ParticipationsPage() {
  const [participations, setParticipations] = useState<Participation[]>([])
  const [citoyens, setCitoyens] = useState<Citoyen[]>([])
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<Participation | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    id_citoyen: "",
    id_consultation: "",
    date_participation: "",
    avis: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [partRes, citRes, conRes] = await Promise.all([
        api.get("/participations"),
        api.get("/citoyens"),
        api.get("/consultations"),
      ])
      setParticipations(partRes.data)
      setCitoyens(citRes.data)
      setConsultations(conRes.data)
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de charger les participations", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const payload = {
        id_citoyen: Number(formData.id_citoyen),
        id_consultation: Number(formData.id_consultation),
        date_participation: formData.date_participation,
        avis: formData.avis || null,
      }
      await api.post("/participations", payload)
      toast({ title: "Succès", description: "Participation créée avec succès" })
      setCreateOpen(false)
      setFormData({ id_citoyen: "", id_consultation: "", date_participation: "", avis: "" })
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
      await api.delete(`/participations/${deleteItem.id_citoyen}/${deleteItem.id_consultation}`)
      toast({ title: "Succès", description: "Participation supprimée" })
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

  const getCitoyenName = (id: number) => {
    const cit = citoyens.find((c) => c.id_citoyen === id)
    return cit?.nom || "-"
  }

  const getConsultationTitle = (id: number) => {
    const con = consultations.find((c) => c.id_consultation === id)
    return con?.titre || "-"
  }

  const columns = [
    { key: "id_citoyen", label: "Citoyen", render: (item: Participation) => getCitoyenName(item.id_citoyen) },
    {
      key: "id_consultation",
      label: "Consultation",
      render: (item: Participation) => getConsultationTitle(item.id_consultation),
    },
    { key: "date_participation", label: "Date" },
    { key: "avis", label: "Avis", render: (item: Participation) => item.avis || "-" },
  ]

  return (
    <div>
      <PageHeader
        title="Participations"
        description="Participations des citoyens aux consultations"
        action={{ label: "Ajouter", onClick: () => setCreateOpen(true) }}
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <DataTable
          data={participations}
          columns={columns}
          loading={loading}
          onDelete={setDeleteItem}
          keyExtractor={(item) => `${item.id_citoyen}-${item.id_consultation}`}
        />
      </motion.div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle participation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Citoyen *</Label>
              <Select value={formData.id_citoyen} onValueChange={(v) => setFormData({ ...formData, id_citoyen: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un citoyen" />
                </SelectTrigger>
                <SelectContent>
                  {citoyens.map((cit) => (
                    <SelectItem key={cit.id_citoyen} value={String(cit.id_citoyen)}>
                      {cit.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Consultation *</Label>
              <Select
                value={formData.id_consultation}
                onValueChange={(v) => setFormData({ ...formData, id_consultation: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une consultation" />
                </SelectTrigger>
                <SelectContent>
                  {consultations.map((con) => (
                    <SelectItem key={con.id_consultation} value={String(con.id_consultation)}>
                      {con.titre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date de participation *</Label>
              <Input
                type="date"
                value={formData.date_participation}
                onChange={(e) => setFormData({ ...formData, date_participation: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Avis</Label>
              <Textarea
                value={formData.avis}
                onChange={(e) => setFormData({ ...formData, avis: e.target.value })}
                placeholder="Avis du citoyen sur la consultation"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.id_citoyen || !formData.id_consultation || !formData.date_participation}
            >
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteItem}
        onOpenChange={() => setDeleteItem(null)}
        title="Supprimer la participation"
        description={`Êtes-vous sûr de vouloir supprimer cette participation ?`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
