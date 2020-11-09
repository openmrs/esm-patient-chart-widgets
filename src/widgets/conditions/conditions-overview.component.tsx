import React, { useState, useEffect } from "react";

import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { DataTableSkeleton } from "carbon-components-react";

import { useCurrentPatient } from "@openmrs/esm-api";
import { createErrorHandler } from "@openmrs/esm-error-handling";

import { ConditionsForm } from "./conditions-form.component";
import { Condition, fetchActiveConditions } from "./conditions.resource";
import useChartBasePath from "../../utils/use-chart-base";
import EmptyState from "../../ui-components/empty-state/empty-state2.component";
import WidgetDataTable from "../../ui-components/datatable/datatable.component";
import { openWorkspaceTab } from "../shared-utils";

export default function ConditionsOverview(props: ConditionsOverviewProps) {
  const initialConditionsCount = 5;
  const { t } = useTranslation();
  const chartBasePath = useChartBasePath();
  const [, patient] = useCurrentPatient();
  const [activeConditions, setActiveConditions] = useState<Condition[]>(null);
  const [itemCount, setItemCount] = useState(0);
  const conditionsPath = chartBasePath + "/" + props.basePath;
  const title = `${t("conditions", "Conditions")}`;

  const headers = [
    {
      key: "display",
      header: `${t("activeConditions", "Active Conditions")}`
    },
    {
      key: "onsetDateTime",
      header: `${t("since", "Since")}`
    }
  ];

  useEffect(() => {
    if (patient) {
      const sub = fetchActiveConditions(patient.identifier[0].value).subscribe(
        conditions => {
          setItemCount(conditions.length);
          setActiveConditions(conditions.slice(0, initialConditionsCount));
        },
        createErrorHandler()
      );

      return () => sub.unsubscribe();
    }
  }, [patient]);

  const getRowItems = rows =>
    rows.map(row => ({
      ...row,
      display: row.display,
      onsetDateTime: dayjs(row.onsetDateTime).format("MMM-YYYY")
    }));

  const RenderConditions = () => {
    if (activeConditions.length) {
      const rows = getRowItems(activeConditions);
      return <WidgetDataTable title={title} headers={headers} rows={rows} itemCount={itemCount} />;
    }
    return (
      <EmptyState
        name={t("conditions", "Conditions")}
        displayText={t("conditions", "conditions")}
      />
    );
  };

  return <>{activeConditions ? <RenderConditions /> : <DataTableSkeleton />}</>;
}

type ConditionsOverviewProps = {
  basePath: string;
};
