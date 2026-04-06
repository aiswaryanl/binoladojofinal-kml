import React, { useState, useEffect } from "react"
import {
  Calendar,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Filter,
  TrendingUp,
} from "lucide-react"

const APIBASE = "http://127.0.0.1:8000"

interface RecurrenceInfo {
  id: number
  training_category: string
  training_name: string
  original_date: string
  completed_date: string
  next_training_date: string
  next_training_creation_date: string
  interval_months: number
  recurring_schedule_created: boolean
  status: "scheduled" | "completed" | "pending"
  trainer: string
  venue: string
  employee_count: number
  recurrence_months?: number | null
  next_training_date_override?: string | null
}

const RecurrenceTracker: React.FC = () => {
  const [recurrences, setRecurrences] = useState<RecurrenceInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "created">(
    "all"
  )
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [newNextTrainingDate, setNewNextTrainingDate] = useState<string>("")

  useEffect(() => {
    fetchRecurrences()
    const interval = setInterval(fetchRecurrences, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchRecurrences = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${APIBASE}/schedules/recurring_schedules_info`)
      if (res.ok) {
        const data = await res.json()
        setRecurrences(data)
      }
    } catch (error) {
      console.error("Error fetching recurrence info", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatDay = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { weekday: "long" })
  }

  const getDaysUntil = (dateString: string | null | undefined) => {
    if (!dateString) return null
    const target = new Date(dateString)
    const today = new Date()
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const getStatusColor = (recurrence: RecurrenceInfo) => {
    if (recurrence.recurring_schedule_created)
      return "bg-green-100 border-green-300 text-green-800"
    const daysUntil = getDaysUntil(recurrence.next_training_creation_date)
    if (daysUntil === null) return "bg-gray-100 border-gray-300 text-gray-800"
    if (daysUntil <= 0) return "bg-red-100 border-red-300 text-red-800"
    if (daysUntil <= 7) return "bg-yellow-100 border-yellow-300 text-yellow-800"
    return "bg-blue-100 border-blue-300 text-blue-800"
  }

  const getStatusIcon = (recurrence: RecurrenceInfo) => {
    if (recurrence.recurring_schedule_created)
      return <CheckCircle2 className="w-5 h-5 text-green-600" />
    const daysUntil = getDaysUntil(recurrence.next_training_creation_date)
    if (daysUntil === null) return <AlertCircle className="w-5 h-5 text-gray-600" />
    if (daysUntil <= 0) return <XCircle className="w-5 h-5 text-red-600" />
    return <Clock className="w-5 h-5 text-blue-600" />
  }

  const getStatusText = (recurrence: RecurrenceInfo) => {
    if (recurrence.recurring_schedule_created) return "Schedule Created"
    const daysUntil = getDaysUntil(recurrence.next_training_creation_date)
    if (daysUntil === null) return "Unknown"
    if (daysUntil <= 0)
      return `Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? "s" : ""}`
    if (daysUntil === 0) return "Creates Today"
    if (daysUntil === 1) return "Creates Tomorrow"
    return `Creates in ${daysUntil} days`
  }

  const filteredRecurrences = recurrences.filter((r) => {
    if (filterStatus === "pending" && r.recurring_schedule_created) return false
    if (filterStatus === "created" && !r.recurring_schedule_created) return false
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      if (
        !(
          r.training_category.toLowerCase().includes(search) ||
          r.training_name.toLowerCase().includes(search) ||
          r.trainer.toLowerCase().includes(search)
        )
      )
        return false
    }
    return true
  })

  const stats = {
    total: recurrences.length,
    pending: recurrences.filter((r) => !r.recurring_schedule_created).length,
    created: recurrences.filter((r) => r.recurring_schedule_created).length,
    overdue: recurrences.filter((r) => {
      const days = getDaysUntil(r.next_training_creation_date)
      return days !== null && days < 0 && !r.recurring_schedule_created
    }).length,
  }

  const handleEditClick = (id: number, currentNextDate: string | null | undefined) => {
    setEditingId(id)
    setNewNextTrainingDate(currentNextDate ?? "")
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setNewNextTrainingDate("")
  }

  const handleSaveNextTrainingDate = async (id: number) => {
    if (!newNextTrainingDate) {
      alert("Please select a valid date")
      return
    }
    try {
      const res = await fetch(`${APIBASE}/schedules/${id}/update_next_training_date/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ next_training_date: newNextTrainingDate }),
      })
      if (res.ok) {
        await fetchRecurrences()
        setEditingId(null)
        setNewNextTrainingDate("")
      } else {
        const error = await res.json()
        alert("Failed to update next training date: " + (error.error || "Unknown error"))
      }
    } catch (error) {
      alert("Network error while updating next training date")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-1920px mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-4 rounded-2xl shadow-lg">
              <RefreshCw className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
              Recurrence Tracker
            </h1>
          </div>
          <p className="text-gray-600 mt-1 text-lg font-medium">
            Monitor recurring training schedules
          </p>
        </div>

        {/* Refresh Button */}
        <div className="mb-6">
          <button
            onClick={fetchRecurrences}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 text-base flex items-center space-x-2"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-200 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <Calendar className="w-10 h-10 text-blue-600" />
              <div className="text-3xl font-bold text-blue-700" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
                {stats.total}
              </div>
            </div>
            <div className="text-sm text-blue-800 font-bold">Total Recurring</div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-2xl border-2 border-amber-200 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <Clock className="w-10 h-10 text-amber-600" />
              <div className="text-3xl font-bold text-amber-700" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
                {stats.pending}
              </div>
            </div>
            <div className="text-sm text-amber-800 font-bold">Pending</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
              <div className="text-3xl font-bold text-green-700" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
                {stats.created}
              </div>
            </div>
            <div className="text-sm text-green-800 font-bold">Created</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-rose-50 p-6 rounded-2xl border-2 border-red-200 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <AlertCircle className="w-10 h-10 text-red-600" />
              <div className="text-3xl font-bold text-red-700" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
                {stats.overdue}
              </div>
            </div>
            <div className="text-sm text-red-800 font-bold">Overdue</div>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 px-8 py-6">
            <h3 className="text-2xl font-bold text-white flex items-center" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
              <Filter className="w-7 h-7 mr-3" />
              Filter Recurrences
            </h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label
                htmlFor="statusFilter"
                className="block text-sm font-bold text-gray-800 mb-2"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                Status Filter
              </label>
              <div id="statusFilter" className="flex space-x-3">
                {["all", "pending", "created"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status as any)}
                    className={`flex-1 px-5 py-4 rounded-2xl text-base font-bold transition-all shadow-sm focus:outline-none ${
                      filterStatus === status
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="searchInput"
                className="block text-sm font-bold text-gray-800 mb-2"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                Search
              </label>
              <input
                id="searchInput"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by category, training, or trainer..."
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 bg-white shadow-sm transition-all text-base font-medium"
              />
            </div>
          </div>
          <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6 text-purple-600 p-0" />
              <p className="text-base text-purple-800 font-bold" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
                Viewing <strong>{filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}</strong> schedules - {filteredRecurrences.length} result{filteredRecurrences.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b-2 border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
                Recurring Training Schedules
              </h3>
              <p className="text-base text-gray-600 mt-1 font-medium">All recurring trainings with their next scheduled dates</p>
            </div>
            <span className="bg-purple-100 text-purple-800 px-6 py-3 rounded-2xl text-base font-bold border-2 border-purple-200 mt-[20px] inline-block">
              {filteredRecurrences.length} schedule{filteredRecurrences.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="text-center py-16">
                <RefreshCw className="w-20 h-20 text-purple-300 mx-auto mb-6 animate-spin" />
                <h3 className="text-2xl font-bold text-gray-800 mb-3" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
                  Loading Recurrences...
                </h3>
              </div>
            ) : filteredRecurrences.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-800 mb-3" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
                  No Recurring Schedules Found
                </h3>
                <p className="text-gray-600 font-medium text-lg mb-6">No recurring training schedules match your filters.</p>
                <button
                  onClick={() => {
                    setFilterStatus("all")
                    setSearchTerm("")
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 text-base"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredRecurrences.map((recurrence) => {
                const daysUntilCreation = getDaysUntil(recurrence.next_training_creation_date)
                const daysUntilTraining = getDaysUntil(recurrence.next_training_date)
                return (
                  <div key={recurrence.id} className={`bg-white rounded-2xl shadow-lg border-2 p-6 hover:shadow-xl transition-shadow ${getStatusColor(recurrence)}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(recurrence)}
                          <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>{recurrence.training_name}</h3>
                        </div>
                        <p className="text-base text-gray-600 font-medium">{recurrence.training_category}</p>
                      </div>
                      <div>
                        <span
                          className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${
                            recurrence.recurring_schedule_created
                              ? "bg-green-100 text-green-800 border-green-300"
                              : daysUntilCreation !== null && daysUntilCreation <= 0
                              ? "bg-red-100 text-red-800 border-red-300"
                              : "bg-blue-100 text-blue-800 border-blue-300"
                          }`}
                        >
                          {recurrence.recurring_schedule_created ? "Created" : daysUntilCreation !== null && daysUntilCreation <= 0 ? "Not Created" : "Scheduled"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 text-base text-gray-700 font-medium">
                      <div className="flex items-center justify-between">
                        <span>Recurrence Interval</span>
                        <span>
                          Every{" "}
                          <strong className="font-bold text-gray-900">
                            {recurrence.recurrence_months ?? recurrence.interval_months} month
                            {(recurrence.recurrence_months ?? recurrence.interval_months) !== 1 ? "s" : ""}
                          </strong>
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Completed</span>
                        <span className="font-bold text-gray-900">{formatDate(recurrence.completed_date)}</span>
                      </div>

                      <div className="border-t-2 border-gray-200 pt-3 mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-700 font-bold">Next Training</span>
                          <span className="font-bold text-purple-700 text-lg">
                            {editingId === recurrence.id ? (
                              <input
                                type="date"
                                value={newNextTrainingDate}
                                onChange={(e) => setNewNextTrainingDate(e.target.value)}
                                className="border px-3 py-2 rounded-md text-gray-900"
                              />
                            ) : recurrence.next_training_date_override ? (
                              <>
                                {formatDate(recurrence.next_training_date_override)}{" "}
                                <small className="text-sm text-gray-600">(Overridden)</small>
                              </>
                            ) : (
                              formatDate(recurrence.next_training_date)
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600 font-medium">
                            {formatDay(
                              editingId === recurrence.id
                                ? newNextTrainingDate
                                : recurrence.next_training_date_override ?? recurrence.next_training_date
                            )}
                          </div>
                          <div className="text-sm text-right font-medium">
                            {daysUntilTraining !== null &&
                              (daysUntilTraining === 0
                                ? "In 0 days Today"
                                : `In ${daysUntilTraining} day${daysUntilTraining !== 1 ? "s" : ""}`)}
                          </div>
                        </div>
                        {editingId === recurrence.id ? (
                          <div className="mt-3 flex gap-3 justify-end">
                            <button
                              onClick={() => handleSaveNextTrainingDate(recurrence.id)}
                              className="bg-purple-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-purple-700 transition"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="bg-gray-300 px-6 py-2 rounded-xl font-bold hover:bg-gray-400 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="mt-3 flex justify-end">
                            <button
                              onClick={() => handleEditClick(recurrence.id, recurrence.next_training_date)}
                              className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition"
                            >
                              Change Date
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-gray-700 font-medium mt-6 pt-3 border-t-2">
                        <span>Schedule Creates</span>
                        <span className="font-bold text-orange-700 text-lg">
                          {formatDate(recurrence.next_training_creation_date)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-gray-700 font-medium mt-2">
                        <span>Trainers</span>
                        <span className="font-bold text-gray-900">{recurrence.trainer}</span>
                      </div>

                      <div className="flex items-center justify-between text-gray-700 font-medium mt-2">
                        <span>Venues</span>
                        <span className="font-bold text-gray-900">{recurrence.venue}</span>
                      </div>

                      <div className="flex items-center justify-between text-gray-700 font-medium mt-2">
                        <span>Employees</span>
                        <span className="font-bold text-gray-900">{recurrence.employee_count}</span>
                      </div>
                    </div>

                    {(!recurrence.recurring_schedule_created && daysUntilCreation !== null && daysUntilCreation < 0) && (
                      <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-red-800 font-medium">
                          <strong>Action Required</strong> Schedule creation is overdue. Check Celery task status or run manually.
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Legend */}
          <div className="mt-8 bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6">
              <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
                Status Legend
              </h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded"></div>
                <span className="text-gray-700 font-medium">Scheduled - Waiting for creation date</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
                <span className="text-gray-700 font-medium">Due Soon - Creates within 7 days</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
                <span className="text-gray-700 font-medium">Overdue - Past creation date</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
                <span className="text-gray-700 font-medium">Completed - Schedule created successfully</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecurrenceTracker
