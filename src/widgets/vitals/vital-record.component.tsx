import React, { useState, useEffect } from "react";
import { useCurrentPatient } from "@openmrs/esm-api";
import { useRouteMatch } from "react-router-dom";
import {
  performPatientsVitalsSearch,
  PatientVitals
} from "./vitals-card.resource";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import styles from "./vital-record.css";
import SummaryCard from "../../ui-components/cards/summary-card.component";
import dayjs from "dayjs";
import { useTranslation, Trans } from "react-i18next";
import VitalsForm from "./vitals-form.component";
import { openWorkspaceTab } from "../shared-utils";
import { ConfigObject } from "../../config-schema";
import withConfig from "../../with-config";

function VitalRecord(props: VitalRecordProps) {
  const [vitalSigns, setVitalSigns] = useState<PatientVitals>(null);
  const [isLoadingPatient, , patientUuid] = useCurrentPatient();
  const match = useRouteMatch();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isLoadingPatient && patientUuid && match.params) {
      const sub = performPatientsVitalsSearch(
        props.config.concepts,
        patientUuid
      ).subscribe(
        vitals =>
          setVitalSigns(
            vitals.find(vital => vital.id === match.params["vitalUuid"])
          ),
        createErrorHandler()
      );
      return () => sub.unsubscribe();
    }
  }, [isLoadingPatient, patientUuid, match.params, props.config]);

  return (
    <>
      {!!(vitalSigns && Object.entries(vitalSigns).length) && (
        <SummaryCard
          name={t("Vital")}
          styles={{ width: "100%" }}
          editComponent={VitalsForm}
          showComponent={() =>
            openWorkspaceTab(VitalsForm, `${t("Edit vitals")}`, {
              vitalUuid: vitalSigns?.id
            })
          }
        >
          <div className={`omrs-type-body-regular ${styles.vitalCard}`}>
            <table className={styles.vitalTable}>
              <tbody>
                <tr>
                  <td className={styles.label}>
                    <Trans i18nKey="measuredAt">Measured at</Trans>
                  </td>
                  <td className={styles.value}>
                    {vitalSigns.date
                      ? dayjs(vitalSigns.date).format("DD-MMM-YYYY hh:mm A")
                      : ""}
                  </td>
                </tr>
                <tr>
                  <td className={styles.label}>
                    <Trans i18nKey="bloodPressure">Blood pressure</Trans>
                  </td>
                  <td className={styles.value}>
                    {vitalSigns.systolic} / {vitalSigns.diastolic}{" "}
                    <span>mmHg</span>
                  </td>
                </tr>
                <tr>
                  <td className={styles.label}>
                    <Trans i18nKey="heartRate">Heart rate</Trans>
                  </td>
                  <td className={styles.value}>
                    {vitalSigns.pulse} <span>bpm</span>
                  </td>
                </tr>
                <tr>
                  <td className={styles.label}>
                    <Trans i18nKey="oxygenSaturation">Oxygen saturation</Trans>
                  </td>
                  <td className={styles.value}>
                    {vitalSigns.oxygenSaturation} <span>%</span>
                  </td>
                </tr>
                <tr>
                  <td className={styles.label}>
                    <Trans i18nKey="temperature">Temperature</Trans>
                  </td>
                  <td className={styles.value}>
                    {vitalSigns.temperature} <span>°C</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </SummaryCard>
      )}
    </>
  );
}

type VitalRecordProps = {
  config?: ConfigObject;
};

export default withConfig(VitalRecord);
