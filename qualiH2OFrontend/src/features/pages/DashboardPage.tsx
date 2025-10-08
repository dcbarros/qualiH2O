import { AnalisesTable } from "../dashboard/components/AnalisesTable";
import { Cards } from "../dashboard/components/Cards";
import { SeriesMetricas } from "../dashboard/components/SeriesMetricas";
import { StatusPie } from "../dashboard/components/StatusPie";

export function DashboardPage() {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-green-900">Dashboard</h2>
            <div className="grid md:grid-cols-3 gap-4">
                <SeriesMetricas metric="PH" title="Série PH"/>
                <SeriesMetricas metric="CONDUTANCIA" title="Série Condutância (µS/cm)" />
                <SeriesMetricas metric="TURBIDEZ" title="Série Turbidez (NTU)" />
            </div>
            <StatusPie />
            <Cards />
            <AnalisesTable />
            
        </div>
    );
}