"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import type { Technicien } from "@/types"
import { PageHeader } from "@/components/ui/page-header"
import { DataTable } from "@/components/ui/data-table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { motion } from "framer-motion"
import { BadgeCheck, BadgeX } from "lucide-react"

export default function TechniciensPage() {
  const [techniciens, setTechniciens] = useState<Technicien[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<Technicien | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    certification: false,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await api.get("/techniciens")
      setTechniciens(res.data)
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de charger les techniciens", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      await api.post("/techniciens", formData)
      toast({ title: "Succès", description: "Technicien créé avec succès" })
      setCreateOpen(false)
      setFormData({ nom: "", prenom: "", certification: false })
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
      await api.delete(`/techniciens/${deleteItem.id_technicien}`)
      toast({ title: "Succès", description: "Technicien supprimé" })
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
    { key: "id_technicien", label: "ID" },
    { key: "nom", label: "Nom" },
    { key: "prenom", label: "Prénom" },
    {
      key: "certification",
      label: "Certifié",
      render: (item: Technicien) =>
        item.certification ? (
          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <BadgeCheck className="h-4 w-4" /> Oui
          </span>
        ) : (
          <span className="flex items-center gap-1 text-muted-foreground">
            <BadgeX className="h-4 w-4" /> Non
          </span>
        ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Techniciens"
        description="Gestion des techniciens de maintenance"
        action={{ label: "Ajouter", onClick: () => setCreateOpen(true) }}
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <DataTable
          data={techniciens}
          columns={columns}
          loading={loading}
          onDelete={setDeleteItem}
          keyExtractor={(item) => item.id_technicien}
        />
      </motion.div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau technicien</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Nom de famille"
              />
            </div>
            <div className="space-y-2">
              <Label>Prénom *</Label>
              <Input
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                placeholder="Prénom"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="certification">Certifié</Label>
              <Switch
                id="certification"
                checked={formData.certification}
                onCheckedChange={(checked) => setFormData({ ...formData, certification: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={!formData.nom || !formData.prenom}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteItem}
        onOpenChange={() => setDeleteItem(null)}
        title="Supprimer le technicien"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteItem?.prenom} ${deleteItem?.nom}" ?`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
