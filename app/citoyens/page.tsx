"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import type { Citoyen, CitoyenEngage } from "@/types"
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
import { Star } from "lucide-react"

export default function CitoyensPage() {
  const [citoyens, setCitoyens] = useState<Citoyen[]>([])
  const [citoyensEngages, setCitoyensEngages] = useState<CitoyenEngage[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<Citoyen | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    nom: "",
    adresse: "",
    telephone: "",
    email: "",
    score_engagement: "0",
    preference_mobilite: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [citRes, engRes] = await Promise.all([api.get("/citoyens"), api.get("/citoyens-plus-engages")])
      setCitoyens(citRes.data)
      setCitoyensEngages(engRes.data)
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de charger les citoyens", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const payload = {
        ...formData,
        score_engagement: Number(formData.score_engagement),
      }
      await api.post("/citoyens", payload)
      toast({ title: "Succès", description: "Citoyen créé avec succès" })
      setCreateOpen(false)
      setFormData({ nom: "", adresse: "", telephone: "", email: "", score_engagement: "0", preference_mobilite: "" })
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
      await api.delete(`/citoyens/${deleteItem.id_citoyen}`)
      toast({ title: "Succès", description: "Citoyen supprimé" })
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
    { key: "id_citoyen", label: "ID" },
    { key: "nom", label: "Nom" },
    { key: "email", label: "Email" },
    { key: "telephone", label: "Téléphone" },
    {
      key: "score_engagement",
      label: "Engagement",
      render: (item: Citoyen) => (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span>{item.score_engagement}</span>
        </div>
      ),
    },
    { key: "preference_mobilite", label: "Mobilité" },
  ]

  return (
    <div>
      <PageHeader
        title="Citoyens"
        description="Gestion des citoyens de la Smart City"
        action={{ label: "Ajouter", onClick: () => setCreateOpen(true) }}
      />

      <div className="space-y-6 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
          <DataTable
            data={citoyens}
            columns={columns}
            loading={loading}
            onDelete={setDeleteItem}
            keyExtractor={(item) => item.id_citoyen}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="W-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Top Citoyens Engagés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={citoyensEngages} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" />
                  <YAxis dataKey="nom" type="category" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Bar dataKey="score_engagement" fill="#FFBB28" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau citoyen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Nom complet"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  placeholder="06 12 34 56 78"
                />
              </div>
              <div className="space-y-2">
                <Label>Score d'engagement</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.score_engagement}
                  onChange={(e) => setFormData({ ...formData, score_engagement: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                placeholder="Adresse complète"
              />
            </div>
            <div className="space-y-2">
              <Label>Préférence de mobilité</Label>
              <Input
                value={formData.preference_mobilite}
                onChange={(e) => setFormData({ ...formData, preference_mobilite: e.target.value })}
                placeholder="Ex: Vélo, Transport en commun"
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
        title="Supprimer le citoyen"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteItem?.nom}" ?`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
