import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { DataTableSkeleton } from "carbon-components-react";

import { useCurrentPatient } from "@openmrs/esm-api";
import { createErrorHandler } from "@openmrs/esm-error-handling";

import VisitNotes from "./visit-note.component";
import { formatNotesDate } from "./notes-helper";
import { getEncounterObservableRESTAPI } from "./encounter.resource";
import useChartBasePath from "../../utils/use-chart-base";
import EmptyState from "../../ui-components/empty-state/empty-state.component";
import WidgetDataTable from "../../ui-components/datatable/datatable.component";
import { PatientNotes } from "../types";
import { openWorkspaceTab } from "../shared-utils";
import styles from "./notes-overview.css";

export default function NotesOverview({ basePath }: NotesOverviewProps) {
  const initialNotesCount = 5;
  const { t } = useTranslation();
  const [patientNotes, setPatientNotes] = useState<Array<PatientNotes>>();
  const [, , patientUuid] = useCurrentPatient();
  const chartBasePath = useChartBasePath();
  const notesPath = chartBasePath + "/" + basePath;
  const title = `${t("notes", "Notes")}`;

  const headers = [
    {
      key: "encounterDate",
      header: `${t("date", "Date")}`
    },
    {
      key: "encounterType",
      header: `${t("encounterType", "Encounter Type")}`
    },
    {
      key: "encounterLocation",
      header: `${t("location", "Location")}`
    },
    {
      key: "encounterAuthor",
      header: `${t("author", "Author")}`
    }
  ];

  useEffect(() => {
    if (patientUuid) {
      const sub = getEncounterObservableRESTAPI(patientUuid).subscribe(
        notes => {
          setPatientNotes(notes.slice(0, initialNotesCount));
        },
        createErrorHandler()
      );
      return () => sub.unsubscribe();
    }
  }, [patientUuid]);

  const getRowItems = rows =>
    rows.map(row => ({
      ...row,
      encounterDate: formatNotesDate(row.encounterDatetime),
      name: row.encounterName,
      location: row.encounterLocation,
      author: row.encounterAuthor ? row.encounterAuthor : "\u2014"
    }));

  const RenderNotes = () => {
    if (patientNotes.length) {
      const rows = getRowItems(patientNotes);
      return <WidgetDataTable title={title} headers={headers} rows={rows} />;
    }
    return (
      <EmptyState
        name={t("notes", "Notes")}
        showComponent={() =>
          openWorkspaceTab(VisitNotes, `${t("visitNotes", "Visit Notes")}`)
        }
        addComponent={VisitNotes}
        displayText={t("notes", "notes")}
      />
    );
  };

  return <>{patientNotes ? <RenderNotes /> : <DataTableSkeleton />}</>;
}

type NotesOverviewProps = {
  basePath: string;
};
