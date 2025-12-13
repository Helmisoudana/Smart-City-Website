"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import type { Mesure, Capteur } from "@/types"
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"

export default function MesuresPage() {
  const [mesures, setMesures] = useState<Mesure[]>([])
  const [capteurs, setCapteurs] = useState<Capteur[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<Mesure | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [selectedCapteur, setSelectedCapteur] = useState<string>("all")
  const [formData, setFormData] = useState({
    date_mesure: "",
    valeur: "",
    unite: "",
    type_mesure: "",
    id_capteur: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [mesRes, capRes] = await Promise.all([api.get("/mesures"), api.get("/capteurs")])
      setMesures(mesRes.data)
      setCapteurs(capRes.data)
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de charger les mesures", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const payload = {
        ...formData,
        valeur: Number(formData.valeur),
      }
      await api.post("/mesures", payload)
      toast({ title: "Succès", description: "Mesure créée avec succès" })
      setCreateOpen(false)
      setFormData({ date_mesure: "", valeur: "", unite: "", type_mesure: "", id_capteur: "" })
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
      await api.delete(`/mesures/${deleteItem.id_mesure}`)
      toast({ title: "Succès", description: "Mesure supprimée" })
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

  const filteredMesures = selectedCapteur === "all" ? mesures : mesures.filter((m) => m.id_capteur === selectedCapteur)

  const chartData = filteredMesures.slice(0, 20).map((m) => ({
    date: new Date(m.date_mesure).toLocaleDateString(),
    valeur: m.valeur,
  }))

  const columns = [
    { key: "id_mesure", label: "ID" },
    { key: "date_mesure", label: "Date", render: (item: Mesure) => new Date(item.date_mesure).toLocaleString() },
    { key: "valeur", label: "Valeur" },
    { key: "unite", label: "Unité" },
    { key: "type_mesure", label: "Type" },
    { key: "id_capteur", label: "Capteur", render: (item: Mesure) => item.id_capteur.slice(0, 8) + "..." },
  ]

  return (
    <div>
      <PageHeader
        title="Mesures"
        description="Données collectées par les capteurs"
        action={{ label: "Ajouter", onClick: () => setCreateOpen(true) }}
      />

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Évolution des mesures</CardTitle>
              <Select value={selectedCapteur} onValueChange={setSelectedCapteur}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Filtrer par capteur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les capteurs</SelectItem>
                  {capteurs.map((cap) => (
                    <SelectItem key={cap.id_capteur} value={cap.id_capteur}>
                      {cap.type_capteur} ({cap.id_capteur.slice(0, 8)}...)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Line type="monotone" dataKey="valeur" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <DataTable
        data={filteredMesures}
        columns={columns}
        loading={loading}
        onDelete={setDeleteItem}
        keyExtractor={(item) => item.id_mesure}
      />

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle mesure</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Capteur *</Label>
              <Select value={formData.id_capteur} onValueChange={(v) => setFormData({ ...formData, id_capteur: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un capteur" />
                </SelectTrigger>
                <SelectContent>
                  {capteurs.map((cap) => (
                    <SelectItem key={cap.id_capteur} value={cap.id_capteur}>
                      {cap.type_capteur} ({cap.id_capteur.slice(0, 8)}...)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date/Heure *</Label>
              <Input
                type="datetime-local"
                value={formData.date_mesure}
                onChange={(e) => setFormData({ ...formData, date_mesure: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valeur *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valeur}
                  onChange={(e) => setFormData({ ...formData, valeur: e.target.value })}
                  placeholder="Ex: 25.5"
                />
              </div>
              <div className="space-y-2">
                <Label>Unité *</Label>
                <Input
                  value={formData.unite}
                  onChange={(e) => setFormData({ ...formData, unite: e.target.value })}
                  placeholder="Ex: °C, ppm, dB"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Type de mesure *</Label>
              <Input
                value={formData.type_mesure}
                onChange={(e) => setFormData({ ...formData, type_mesure: e.target.value })}
                placeholder="Ex: température, pollution, bruit"
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
                !formData.id_capteur ||
                !formData.date_mesure ||
                !formData.valeur ||
                !formData.unite ||
                !formData.type_mesure
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
        title="Supprimer la mesure"
        description={`Êtes-vous sûr de vouloir supprimer cette mesure (${deleteItem?.type_mesure}: ${deleteItem?.valeur} ${deleteItem?.unite}) ?`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
