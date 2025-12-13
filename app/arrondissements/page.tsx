"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import type { Arrondissement, ZonePollution } from "@/types"
import { PageHeader } from "@/components/ui/page-header"
import { DataTable } from "@/components/ui/data-table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"

export default function ArrondissementsPage() {
  const [arrondissements, setArrondissements] = useState<Arrondissement[]>([])
  const [zonesPollution, setZonesPollution] = useState<ZonePollution[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<Arrondissement | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    nom_arrondissement: "",
    type_arrondissement: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [arrRes, ZonePollution] = await Promise.all([api.get("/arrondissements"), api.get("/zones-plus-polluees")])
      setArrondissements(arrRes.data)
      setZonesPollution(ZonePollution.data)
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de charger les arrondissements", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      await api.post("/arrondissements", formData)
      toast({ title: "Succès", description: "Arrondissement créé avec succès" })
      setCreateOpen(false)
      setFormData({ nom_arrondissement: "", type_arrondissement: "" })
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
      await api.delete(`/arrondissements/${deleteItem.id_arrondissement}`)
      toast({ title: "Succès", description: "Arrondissement supprimé" })
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
    { key: "id_arrondissement", label: "ID" },
    { key: "nom_arrondissement", label: "Nom" },
    { key: "type_arrondissement", label: "Type" },
  ]

return (
  <div>
    <PageHeader
      title="Arrondissements"
      description="Gestion des arrondissements de la ville"
      action={{ label: "Ajouter", onClick: () => setCreateOpen(true) }}
    />

    {/* TABLE – pleine largeur */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <DataTable
        data={arrondissements}
        columns={columns}
        loading={loading}
        onDelete={setDeleteItem}
        keyExtractor={(item) => item.id_arrondissement}
      />
    </motion.div>

    {/* CHART – pleine largeur */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Pollution par zone</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={zonesPollution}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="arrondissement" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar
                dataKey="score_total"
                fill="#FF8042"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>

    {/* Create Dialog */}
    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvel arrondissement</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom de l'arrondissement *</Label>
            <Input
              id="nom"
              value={formData.nom_arrondissement}
              onChange={(e) =>
                setFormData({ ...formData, nom_arrondissement: e.target.value })
              }
              placeholder="Ex: Centre-ville"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Input
              id="type"
              value={formData.type_arrondissement}
              onChange={(e) =>
                setFormData({ ...formData, type_arrondissement: e.target.value })
              }
              placeholder="Ex: Résidentiel"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setCreateOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleCreate} disabled={!formData.nom_arrondissement}>
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Delete Confirmation */}
    <ConfirmDialog
      open={!!deleteItem}
      onOpenChange={() => setDeleteItem(null)}
      title="Supprimer l'arrondissement"
      description={`Êtes-vous sûr de vouloir supprimer "${deleteItem?.nom_arrondissement}" ?`}
      onConfirm={handleDelete}
      loading={deleting}
    />
  </div>
)

}
