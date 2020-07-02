import { openmrsFetch } from "@openmrs/esm-api";
import { includes, split } from "lodash-es";

function getImmunizationsConceptSetByUuid(
  immunizationsConceptSetSearchText: string,
  abortController: AbortController
) {
  return openmrsFetch(
    `/ws/rest/v1/concept/${immunizationsConceptSetSearchText}?v=full`,
    {
      signal: abortController.signal
    }
  ).then(response => response.data);
}

function isConceptMapping(searchText: string) {
  return includes(searchText, ":");
}

function searchImmunizationsConceptSetByMapping(
  immunizationsConceptSetSearchText: string,
  abortController: AbortController
) {
  const [source, code] = split(immunizationsConceptSetSearchText, ":");
  return openmrsFetch(
    `/ws/rest/v1/concept?source=${source}&code=${code}&v=full`,
    {
      signal: abortController.signal
    }
  ).then(response => response.data.results[0]);
}

export function getImmunizationsConceptSet(
  immunizationsConceptSetSearchText: string,
  abortController: AbortController
) {
  if (isConceptMapping(immunizationsConceptSetSearchText)) {
    return searchImmunizationsConceptSetByMapping(
      immunizationsConceptSetSearchText,
      abortController
    );
  } else {
    return getImmunizationsConceptSetByUuid(
      immunizationsConceptSetSearchText,
      abortController
    );
  }
}

export function performPatientImmunizationsSearch(
  patientIdentifier: string,
  patientUuid: string,
  abortController: AbortController
) {
  return openmrsFetch(`/ws/rest/v1/${patientUuid}/fhir/immunization`, {
    signal: abortController.signal
  }).then(response => response.data);
}

export function savePatientImmunization(
  patientImmunization,
  patientUuid,
  immunizationObsUuid,
  abortController
) {
  let immunizationEndpoint = `/ws/rest/v1/${patientUuid}/fhir/immunization`;
  if (immunizationObsUuid) {
    immunizationEndpoint = `${immunizationEndpoint}/${immunizationObsUuid}`;
  }
  return openmrsFetch(immunizationEndpoint, {
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST",
    body: patientImmunization,
    signal: abortController.signal
  });
}
