import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import capitalize from "lodash-es/capitalize";
import useChartBasePath from "../../utils/use-chart-base";
import SummaryCard from "../../ui-components/cards/summary-card.component";
import RecordDetails from "../../ui-components/cards/record-details-card.component";
import styles from "./condition-record.css";
import { useRouteMatch } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import { useCurrentPatient, createErrorHandler } from "@openmrs/esm-framework";
import { openWorkspaceTab } from "../shared-utils";
import { ConditionsForm } from "./conditions-form.component";
import { getConditionByUuid } from "./conditions.resource";

export default function ConditionRecord(props: ConditionRecordProps) {
  const chartBasePath = useChartBasePath();
  const match = useRouteMatch();
  const [patientCondition, setPatientCondition] = useState(null);
  const [isLoadingPatient, patient] = useCurrentPatient();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isLoadingPatient && patient) {
      const sub = getConditionByUuid(match.params["conditionUuid"]).subscribe(
        condition => setPatientCondition(condition),
        createErrorHandler()
      );
      return () => sub.unsubscribe();
    }
  }, [isLoadingPatient, patient, match.params]);

  return (
    <>
      {!!(patientCondition && Object.entries(patientCondition).length) && (
        <div className={styles.conditionContainer}>
          <SummaryCard
            name={t("condition", "Condition")}
            styles={{ width: "100%" }}
            editComponent={ConditionsForm}
            showComponent={() => {
              openWorkspaceTab(
                ConditionsForm,
                `${t("editCondition", "Edit Condition")}`,
                {
                  conditionUuid: patientCondition?.id,
                  conditionName: patientCondition?.display,
                  clinicalStatus: patientCondition?.clinicalStatus,
                  onsetDateTime: patientCondition?.onsetDateTime
                }
              );
            }}
            link={`${chartBasePath}/conditions`}
          >
            <div className={`omrs-type-body-regular ${styles.conditionCard}`}>
              <div>
                <p className="omrs-type-title-3">{patientCondition.display}</p>
              </div>
              <table className={styles.conditionTable}>
                <thead>
                  <tr>
                    <th>
                      <Trans i18nKey="onsetDate">Onset date</Trans>
                    </th>
                    <th>
                      <Trans i18nKey="status">Status</Trans>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      {dayjs(patientCondition.onsetDateTime).format("MMM-YYYY")}
                    </td>
                    <td>{capitalize(patientCondition.clinicalStatus)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SummaryCard>
          <RecordDetails>
            <table className={styles.conditionTable}>
              <thead>
                <tr>
                  <th>
                    <Trans i18nKey="lastUpdated">Last updated</Trans>
                  </th>
                  <th>
                    <Trans i18nKey="lastUpdatedBy">Last updated by</Trans>
                  </th>
                  <th>
                    <Trans i18nKey="lastUpdatedLocation">
                      Last updated location
                    </Trans>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    {patientCondition?.lastUpdated
                      ? dayjs(patientCondition?.lastUpdated).format(
                          "DD-MMM-YYYY"
                        )
                      : "-"}
                  </td>
                  <td>{patientCondition?.lastUpdatedBy ?? "-"}</td>
                  <td>{patientCondition?.lastUpdatedLocation ?? "-"}</td>
                </tr>
              </tbody>
            </table>
          </RecordDetails>
        </div>
      )}
    </>
  );
}

type ConditionRecordProps = {};
