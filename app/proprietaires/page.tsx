"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import type { Proprietaire } from "@/types"
import { PageHeader } from "@/components/ui/page-header"
import { DataTable } from "@/components/ui/data-table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { Building } from "lucide-react"

export default function ProprietairesPage() {
  const [proprietaires, setProprietaires] = useState<Proprietaire[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<Proprietaire | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    nom: "",
    type: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await api.get("/proprietaires")
      setProprietaires(res.data)
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de charger les propriétaires", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      await api.post("/proprietaires", formData)
      toast({ title: "Succès", description: "Propriétaire créé avec succès" })
      setCreateOpen(false)
      setFormData({ nom: "", type: "" })
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
      await api.delete(`/proprietaires/${deleteItem.id_proprietaire}`)
      toast({ title: "Succès", description: "Propriétaire supprimé" })
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
    { key: "id_proprietaire", label: "ID" },
    {
      key: "nom",
      label: "Nom",
      render: (item: Proprietaire) => (
        <span className="flex items-center gap-2">
          <Building className="h-4 w-4 text-primary" />
          {item.nom}
        </span>
      ),
    },
    { key: "type", label: "Type" },
  ]

  return (
    <div>
      <PageHeader
        title="Propriétaires"
        description="Gestion des propriétaires de capteurs"
        action={{ label: "Ajouter", onClick: () => setCreateOpen(true) }}
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <DataTable
          data={proprietaires}
          columns={columns}
          loading={loading}
          onDelete={setDeleteItem}
          keyExtractor={(item) => item.id_proprietaire}
        />
      </motion.div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau propriétaire</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Nom du propriétaire"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Input
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="Ex: Entreprise, Municipalité"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={!formData.nom}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteItem}
        onOpenChange={() => setDeleteItem(null)}
        title="Supprimer le propriétaire"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteItem?.nom}" ?`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
