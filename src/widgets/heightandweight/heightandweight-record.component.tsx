import React, { useState, useEffect } from "react";
import { useRouteMatch } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import { useCurrentPatient } from "@openmrs/esm-api";
import { ConfigObject } from "../../config-schema";
import withConfig from "../../with-config";
import RecordDetails from "../../ui-components/cards/record-details-card.component";
import SummaryCard from "../../ui-components/cards/summary-card.component";
import { openWorkspaceTab } from "../shared-utils";
import VitalsForm from "../vitals/vitals-form.component";
import {
  convertToPounds,
  convertToFeet,
  convertoToInches,
  customDateFormat
} from "./heightandweight-helper";
import { getDimensions } from "./heightandweight.resource";
import styles from "./heightandweight-record.css";

function HeightAndWeightRecord(props: HeightAndWeightRecordProps) {
  const { t } = useTranslation();
  const [dimensions, setDimensions] = useState<any>({});
  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();
  const match = useRouteMatch();

  useEffect(() => {
    if (!isLoadingPatient && patientUuid && match.params) {
      const sub = getDimensions(
        props.config.concepts.weightUuid,
        props.config.concepts.heightUuid,
        patientUuid
      ).subscribe(dimensions => {
        setDimensions(
          dimensions.find(
            dimension => dimension.id === match.params["heightWeightUuid"]
          )
        );
        createErrorHandler();
      });
      return () => sub && sub.unsubscribe();
    }
  }, [
    match.params,
    patientUuid,
    isLoadingPatient,
    props.config.concepts.weightUuid,
    props.config.concepts.heightUuid
  ]);

  return (
    <>
      {!!(dimensions && Object.entries(dimensions).length) && (
        <div className={styles.dimensionsContainer}>
          <SummaryCard
            name="Height & Weight"
            showComponent={() =>
              openWorkspaceTab(VitalsForm, "Edit Vitals Form", {
                vitalUuid: match.params["heightWeightUuid"]
              })
            }
            editComponent={VitalsForm}
            styles={{ width: "100%" }}
          >
            <div className={styles.dimensionsCard}>
              <table className={styles.summaryTable}>
                <tbody>
                  <tr>
                    <td>Measured at </td>
                    <td>
                      {[
                        customDateFormat(
                          dimensions?.obsData?.weight?.effectiveDatetime,
                          "DD-MMM-YYYY"
                        ),
                        customDateFormat(
                          dimensions?.obsData?.weight?.effectiveDatetime,
                          "HH:mm A"
                        )
                      ].join(" ")}
                    </td>
                  </tr>
                  <tr>
                    <td>Weight</td>
                    <td>
                      {dimensions.weight} <span>kg</span>
                    </td>
                    <td>
                      {convertToPounds(dimensions.weight)} <span>lbs</span>
                    </td>
                  </tr>
                  <tr>
                    <td>Height</td>
                    <td>
                      {dimensions.height} <span>cm</span>
                    </td>
                    <td>
                      {convertToFeet(dimensions.height)} <span>feet</span>{" "}
                      {convertoToInches(dimensions.height)} <span>inches</span>
                    </td>
                  </tr>
                  <tr>
                    <td>BMI</td>
                    <td>
                      {dimensions.bmi} <span>Kg/m2</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SummaryCard>
          <RecordDetails>
            <table className={styles.heightAndWeightDetailsTable}>
              <thead>
                <tr>
                  <td>Last updated</td>
                  <td>Last updated by</td>
                  <td>Last updated location</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
              </tbody>
            </table>
          </RecordDetails>
        </div>
      )}
    </>
  );
}

type HeightAndWeightRecordProps = {
  config: ConfigObject;
};

export default withConfig(HeightAndWeightRecord);
