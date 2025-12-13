"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import api from "@/lib/api"
import type { ZonePollution, TauxDisponibilite, CitoyenEngage, TrajetEconomique , InterventionPredictive} from "@/types"
import { PageHeader } from "@/components/ui/page-header"
import { ChartSkeleton } from "@/components/ui/loading-skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle, Activity, Users, Leaf } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"]

export default function AnalyticsPage() {
  const [zonesPollution, setZonesPollution] = useState<ZonePollution[]>([])
  const [tauxDisponibilite, setTauxDisponibilite] = useState<TauxDisponibilite[]>([])
  const [citoyensEngages, setCitoyensEngages] = useState<CitoyenEngage[]>([])
  const [trajetsEconomiques, setTrajetsEconomiques] = useState<TrajetEconomique[]>([])
  const [interventionsPredictives, setInterventionsPredictives] = useState<InterventionPredictive | null>(null)

  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const [zonesRes, tauxRes, citoyensRes, trajetsRes ,interRes] = await Promise.all([
        api.get("/zones-plus-polluees"),
        api.get("/taux-disponibilite-capteurs"),
        api.get("/citoyens-plus-engages"),
        api.get("/trajets-plus-economiques"),
        api.get("/interventions-predictives"),
      ])
      setZonesPollution(zonesRes.data)
      setTauxDisponibilite(tauxRes.data)
      setCitoyensEngages(citoyensRes.data)
      setTrajetsEconomiques(trajetsRes.data)
      setInterventionsPredictives(interRes.data)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les analytics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Analytics" description="Analyses avancées de la Smart City" />
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <ChartSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Analytics" description="Analyses avancées de la Smart City" />
    {/* Summary stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Résumé des données</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-pink-50 dark:bg-pink-950/30">
                <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                  {interventionsPredictives?.nombre_interventions ?? 0}
                </p>
                <p className="text-sm text-muted-foreground">Interventions prédictives</p>
                <p className="text-sm text-muted-foreground">
                  CO2 économisé : {interventionsPredictives?.economie_co2 ?? 0} kg
                </p>
              </div>

              <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{tauxDisponibilite.length}</p>
                <p className="text-sm text-muted-foreground">Types de capteurs</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/30">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{citoyensEngages.length}</p>
                <p className="text-sm text-muted-foreground">Citoyens engagés</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {trajetsEconomiques.reduce((sum, t) => sum + t.economie_co2, 0).toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">kg CO2 économisés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Zones les plus polluées */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Zones les plus polluées
              </CardTitle>
              <CardDescription>Niveau de pollution par arrondissement</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={zonesPollution.map((z) => ({ label: z.arrondissement, niveau_pollution: z.score_total }))}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" />
                  <YAxis dataKey="label" type="category" width={140} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value}`, "Score total"]}
                  />
                  <Bar dataKey="niveau_pollution" fill="#FF8042" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Taux de disponibilité des capteurs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Disponibilité des capteurs
              </CardTitle>
              <CardDescription>Taux de disponibilité par type de capteur</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={tauxDisponibilite}>
                  <PolarGrid className="stroke-muted" />
                  <PolarAngleAxis dataKey="arrondissement" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Disponibilité"
                    dataKey="taux_disponibilite"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.5}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Citoyens les plus engagés */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                Citoyens les plus engagés
              </CardTitle>
              <CardDescription>Top citoyens par score d'engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={citoyensEngages}
                    dataKey="score_engagement"
                    nameKey="nom"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    label={({ nom }) => nom}
                  >
                    {citoyensEngages.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trajets les plus économiques */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-emerald-500" />
                Trajets les plus économiques
              </CardTitle>
              <CardDescription>Économie de CO2 par trajet (kg)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={trajetsEconomiques.map((t) => ({
                    label: `${t.origine} → ${t.destination}`,
                    economie_co2: t.economie_co2,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value} kg CO2`, "Économie"]}
                  />
                  <Bar dataKey="economie_co2" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      
    </div>
  )
}
