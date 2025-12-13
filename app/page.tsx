"use client"

import { useEffect, useState, useMemo  } from "react"
import { motion } from "framer-motion"
import api from "@/lib/api"
import type { Capteur, Citoyen, Intervention, ZonePollution, TauxDisponibilite } from "@/types"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { CardSkeleton, ChartSkeleton } from "@/components/ui/loading-skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Radio, Users, Hammer, AlertTriangle, Activity, Leaf } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
} from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function DashboardPage() {
  const [capteurs, setCapteurs] = useState<Capteur[]>([])
  const [citoyens, setCitoyens] = useState<Citoyen[]>([])
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [zonesPollution, setZonesPollution] = useState<ZonePollution[]>([])
  const [tauxDisponibilite, setTauxDisponibilite] = useState<TauxDisponibilite[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [capteursRes, citoyensRes, ZonePollution, zonesRes, tauxRes] = await Promise.all([
        api.get("/capteurs"),
        api.get("/citoyens"),
        api.get("/interventions"),
        api.get("/zones-plus-polluees"),
        api.get("/taux-disponibilite-capteurs"),
      ])
      setCapteurs(capteursRes.data)
      setCitoyens(citoyensRes.data)
      setInterventions(ZonePollution.data)
      setZonesPollution(zonesRes.data)
      setTauxDisponibilite(tauxRes.data)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du dashboard",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const capteursActifs = capteurs.filter((c) => c.statut === "actif").length
  const coutTotal = interventions.reduce((sum, i) => sum + i.cout, 0)
  const engagementMoyen =
    citoyens.length > 0 ? Math.round(citoyens.reduce((sum, c) => sum + c.score_engagement, 0) / citoyens.length) : 0

  const interventionsByDate = useMemo(() => {
    const map: Record<string, { date: string; cout: number; duree: number }> = {}

    interventions.forEach((i) => {
      const date = new Date(i.date_intervention).toLocaleDateString()

      if (!map[date]) {
        map[date] = { date, cout: 0, duree: 0 }
      }

      map[date].cout += i.cout
      map[date].duree += i.duree
    })

    return Object.values(map).slice(-10)
  }, [interventions])



  if (loading) {
    return (
      <div>
        <PageHeader title="Dashboard" description="Vue d'ensemble de la Smart City" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Dashboard" description="Vue d'ensemble de la Smart City" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Capteurs"
          value={capteurs.length}
          description={`${capteursActifs} actifs`}
          icon={Radio}
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          title="Citoyens"
          value={citoyens.length}
          description={`Score moyen: ${engagementMoyen}`}
          icon={Users}
        />
        <StatCard
          title="Interventions"
          value={interventions.length}
          description={`Coût total: ${coutTotal.toLocaleString()} €`}
          icon={Hammer}
        />
        <StatCard
          title="Zones à risque"
          value={zonesPollution.length}
          description="Zones surveillées"
          icon={AlertTriangle}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
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

      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-500" />
            Évolution des interventions dans le temps
          </CardTitle>
          <CardDescription>Analyse par date (coût et durée cumulés)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={interventionsByDate}>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <Tooltip />
              <Line type="monotone" dataKey="cout" stroke="#6366f1" strokeWidth={2} name="Coût (€)" />
              <Line type="monotone" dataKey="duree" stroke="#22c55e" strokeWidth={2} name="Durée (h)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      </motion.div>
    </div>
  )
}
