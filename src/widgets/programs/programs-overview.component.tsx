import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import SummaryCard from "../../ui-components/cards/summary-card.component";
import SummaryCardRow from "../../ui-components/cards/summary-card-row.component";
import SummaryCardRowContent from "../../ui-components/cards/summary-card-row-content.component";
import EmptyState from "../../ui-components/empty-state/empty-state.component";
import { fetchEnrolledPrograms } from "./programs.resource";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import HorizontalLabelValue from "../../ui-components/cards/horizontal-label-value.component";
import { useCurrentPatient } from "@openmrs/esm-api";
import SummaryCardFooter from "../../ui-components/cards/summary-card-footer.component";
import { useTranslation } from "react-i18next";
import ProgramsForm from "./programs-form.component";
import { openWorkspaceTab } from "../shared-utils";
import useChartBasePath from "../../utils/use-chart-base";

export default function ProgramsOverview(props: ProgramsOverviewProps) {
  const [patientPrograms, setPatientPrograms] = useState(null);
  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();
  const { t } = useTranslation();
  const chartBasePath = useChartBasePath();
  const programsPath = chartBasePath + "/" + props.basePath;

  useEffect(() => {
    if (patientUuid) {
      const subscription = fetchEnrolledPrograms(patientUuid).subscribe(
        programs => setPatientPrograms(programs),
        createErrorHandler()
      );

      return () => subscription.unsubscribe();
    }
  }, [patientUuid]);

  return (
    <>
      {patientPrograms && patientPrograms.length > 0 ? (
        <SummaryCard
          name={t("Care Programs", "Care Programs")}
          link={programsPath}
          styles={{ margin: "1.25rem, 1.5rem" }}
          addComponent={ProgramsForm}
          showComponent={() =>
            openWorkspaceTab(
              ProgramsForm,
              `${t("Programs Form", "Programs Form")}`
            )
          }
        >
          <SummaryCardRow>
            <SummaryCardRowContent>
              <HorizontalLabelValue
                label={t("Active Programs", "Active Programs")}
                labelStyles={{
                  color: "var(--omrs-color-ink-medium-contrast)",
                  fontFamily: "Work Sans"
                }}
                value={t("Since", "Since")}
                valueStyles={{
                  color: "var(--omrs-color-ink-medium-contrast)",
                  fontFamily: "Work Sans"
                }}
              />
            </SummaryCardRowContent>
          </SummaryCardRow>
          {patientPrograms.map(program => {
            return (
              <SummaryCardRow
                key={program.uuid}
                linkTo={`${programsPath}/${program.uuid}`}
              >
                <HorizontalLabelValue
                  label={program.display}
                  labelStyles={{ fontWeight: 500 }}
                  value={dayjs(program.dateEnrolled).format("MMM-YYYY")}
                  valueStyles={{ fontFamily: "Work Sans" }}
                />
              </SummaryCardRow>
            );
          })}
          <SummaryCardFooter linkTo={`${programsPath}`} />
        </SummaryCard>
      ) : (
        <EmptyState
          showComponent={() => openWorkspaceTab(ProgramsForm, "Programs Form")}
          addComponent={ProgramsForm}
          name="Care Programs"
          displayText="This patient has no program enrollments recorded in the system."
        />
      )}
    </>
  );
}

type ProgramsOverviewProps = {
  basePath: string;
};
