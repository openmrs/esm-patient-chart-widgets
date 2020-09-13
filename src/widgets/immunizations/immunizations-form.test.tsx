import React from "react";
import { BrowserRouter } from "react-router-dom";
import dayjs from "dayjs";
import { of } from "rxjs/internal/observable/of";
import { cleanup, fireEvent, render, wait } from "@testing-library/react";
import { useCurrentPatient, openmrsObservableFetch } from "@openmrs/esm-api";
import { patient } from "../../../__mocks__/immunizations.mock";
import { ImmunizationsForm } from "./immunizations-form.component";
import { savePatientImmunization } from "./immunizations.resource";
import { getStartedVisit, visitItem } from "../visit/visit-utils";
import { mockSessionDataResponse } from "../../../__mocks__/session.mock";

const mockUseCurrentPatient = useCurrentPatient as jest.Mock;
const mockSavePatientImmunization = savePatientImmunization as jest.Mock;
const mockOpenmrsObservableFetch = openmrsObservableFetch as jest.Mock;

jest.mock("@openmrs/esm-api", () => ({
  useCurrentPatient: jest.fn(),
  openmrsObservableFetch: jest.fn()
}));

jest.mock("./immunizations.resource", () => ({
  savePatientImmunization: jest.fn()
}));

describe("<ImmunizationsForm />", () => {
  let match = { params: {} };
  let wrapper: any;

  getStartedVisit.getValue = function() {
    const mockVisitItem: visitItem = {
      visitData: { uuid: "visitUuid" }
    };
    return mockVisitItem;
  };
  mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
  mockOpenmrsObservableFetch.mockImplementation(() =>
    of(mockSessionDataResponse)
  );

  afterEach(cleanup);
  afterEach(mockSavePatientImmunization.mockReset);

  it("renders immunization form without dying", async () => {
    match.params = {
      vaccineName: "Rotavirus"
    };

    wrapper = render(
      <BrowserRouter>
        <ImmunizationsForm match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
    });
  });

  it("displays the appropriate fields when adding a new immunization without sequence", async () => {
    match.params = {
      vaccineName: "Rotavirus"
    };

    wrapper = render(
      <BrowserRouter>
        <ImmunizationsForm match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
      expect(wrapper.getByText("Add Vaccine: Rotavirus")).toBeDefined();
      expect(wrapper.queryByText("Sequence")).toBeNull();
      expect(wrapper.getByText("Vaccination Date")).toBeDefined();
      expect(wrapper.getByText("Expiration Date")).toBeDefined();
      expect(wrapper.getByText("Lot Number")).toBeDefined();
      expect(wrapper.getByText("Manufacturer")).toBeDefined();
      expect(wrapper.getByText("Cancel")).toBeDefined();
      expect(wrapper.getByText("Save")).toBeDefined();
    });
  });

  it("displays the appropriate fields when adding a new immunization with sequence", async () => {
    match.params = {
      vaccineName: "Rotavirus",
      sequences: [
        { sequenceLabel: "2 Months", sequenceNumber: 1 },
        { sequenceLabel: "4 Months", sequenceNumber: 2 },
        { sequenceLabel: "6 Months", sequenceNumber: 3 }
      ]
    };

    wrapper = render(
      <BrowserRouter>
        <ImmunizationsForm match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
      expect(wrapper.getByText("Add Vaccine: Rotavirus")).toBeDefined();
      expect(wrapper.getByText("Vaccination Date")).toBeDefined();
      expect(wrapper.getByText("Expiration Date")).toBeDefined();
      expect(wrapper.getByText("Lot Number")).toBeDefined();
      expect(wrapper.getByText("Sequence")).toBeDefined();
      expect(wrapper.getByText("Manufacturer")).toBeDefined();
      expect(wrapper.getByText("Cancel")).toBeDefined();
      expect(wrapper.getByText("Save")).toBeDefined();
    });
  });

  it("displays the appropriate fields and values when editing an existing immunization without sequence", async () => {
    match.params = {
      immunizationObsUuid: "b9c21a82-aed3-11ea-b3de-0242ac130004",
      vaccineName: "Rotavirus",
      manufacturer: "Organization/hl7",
      expirationDate: "2018-12-15",
      vaccinationDate: "2018-06-18",
      lotNumber: "12345"
    };

    wrapper = render(
      <BrowserRouter>
        <ImmunizationsForm match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
      expect(wrapper.getByText("Edit Vaccine: Rotavirus")).toBeDefined();
      expect(wrapper.getByTestId("vaccinationDateInput").value).toBe(
        "2018-06-18"
      );
      expect(wrapper.getByTestId("vaccinationExpirationInput").value).toBe(
        "2018-12-15"
      );
      expect(wrapper.getByTestId("lotNumberInput").value).toBe("12345");
      expect(wrapper.getByTestId("manufacturerInput").value).toBe(
        "Organization/hl7"
      );
      expect(wrapper.getByText("Cancel")).toBeDefined();
      expect(wrapper.getByText("Save")).toBeDefined();
    });
  });

  it("displays the appropriate fields and values when editing an existing immunization with sequence", async () => {
    match.params = {
      immunizationObsUuid: "b9c21a82-aed3-11ea-b3de-0242ac130004",
      vaccineName: "Rotavirus",
      manufacturer: "Organization/hl7",
      expirationDate: "2018-12-15",
      vaccinationDate: "2018-06-18",
      lotNumber: "12345",
      sequences: [
        { sequenceLabel: "2 Months", sequenceNumber: 1 },
        { sequenceLabel: "4 Months", sequenceNumber: 2 },
        { sequenceLabel: "6 Months", sequenceNumber: 3 }
      ],
      currentDose: { sequenceLabel: "2 Months", sequenceNumber: 1 }
    };

    wrapper = render(
      <BrowserRouter>
        <ImmunizationsForm match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
      expect(wrapper.getByText("Edit Vaccine: Rotavirus")).toBeDefined();
      expect(wrapper.getByText("2 Months").value).toBeDefined();
      expect(wrapper.getByLabelText("Sequence").value).toBe("1");
      expect(wrapper.getByTestId("vaccinationDateInput").value).toBe(
        "2018-06-18"
      );
      expect(wrapper.getByTestId("vaccinationExpirationInput").value).toBe(
        "2018-12-15"
      );
      expect(wrapper.getByTestId("lotNumberInput").value).toBe("12345");
      expect(wrapper.getByTestId("manufacturerInput").value).toBe(
        "Organization/hl7"
      );
      expect(wrapper.getByText("Cancel")).toBeDefined();
      expect(wrapper.getByText("Save")).toBeDefined();
    });
  });

  it("should have save button disabled unless data entered", async () => {
    mockSavePatientImmunization.mockResolvedValue({ status: 200 });
    match.params = {
      vaccineName: "Rotavirus"
    };

    wrapper = render(
      <BrowserRouter>
        <ImmunizationsForm match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
      expect(wrapper.getByText("Save")).toBeDisabled();
    });
  });

  it("should enable save button when mandatory fields are selected", async () => {
    mockSavePatientImmunization.mockResolvedValue({ status: 200 });
    match.params = {
      vaccineName: "Rotavirus"
    };

    wrapper = render(
      <BrowserRouter>
        <ImmunizationsForm match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      const vaccinationDate = wrapper.getByTestId("vaccinationDateInput");
      fireEvent.change(vaccinationDate, { target: { value: "2020-06-15" } });
      expect(wrapper.getByText("Save")).toBeEnabled();
    });
  });

  it("makes a call to create new immnunization without sequence", async () => {
    mockSavePatientImmunization.mockResolvedValue({ status: 200 });
    match.params = {
      vaccineName: "Rotavirus",
      vaccineUuid: "RotavirusUuid"
    };

    wrapper = render(
      <BrowserRouter>
        <ImmunizationsForm match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      const vaccinationDate = wrapper.getByTestId("vaccinationDateInput");
      fireEvent.change(vaccinationDate, { target: { value: "2020-06-15" } });

      const vaccinationExpiration = wrapper.getByTestId(
        "vaccinationExpirationInput"
      );
      fireEvent.change(vaccinationExpiration, {
        target: { value: "2020-06-30" }
      });

      const lotNumber = wrapper.getByTestId("lotNumberInput");
      fireEvent.change(lotNumber, { target: { value: "19876" } });

      const manufacturer = wrapper.getByTestId("manufacturerInput");
      fireEvent.change(manufacturer, { target: { value: "XYTR4" } });

      fireEvent.submit(wrapper.getByTestId("immunization-form"));
      expect(mockSavePatientImmunization).toBeCalled();

      const firstArgument = mockSavePatientImmunization.mock.calls[0][0];
      expectImmunization(
        firstArgument,
        undefined,
        "visitUuid",
        undefined,
        undefined,
        "19876"
      );

      const secondArgument = mockSavePatientImmunization.mock.calls[0][1];
      expect(secondArgument).toBe(patient.id);

      const thirdArgument = mockSavePatientImmunization.mock.calls[0][2];
      expect(thirdArgument).toBeUndefined();
    });
  });

  it("makes a call to create new immnunization with sequence", async () => {
    mockSavePatientImmunization.mockResolvedValue({ status: 200 });
    match.params = {
      vaccineName: "Rotavirus",
      vaccineUuid: "RotavirusUuid",
      sequences: [
        { sequenceLabel: "2 Months", sequenceNumber: 1 },
        { sequenceLabel: "4 Months", sequenceNumber: 2 },
        { sequenceLabel: "6 Months", sequenceNumber: 3 }
      ]
    };

    wrapper = render(
      <BrowserRouter>
        <ImmunizationsForm match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      const sequence = wrapper.getByLabelText("Sequence");
      fireEvent.change(sequence, { target: { value: 2 } });

      const vaccinationDate = wrapper.getByTestId("vaccinationDateInput");
      fireEvent.change(vaccinationDate, { target: { value: "2020-06-15" } });

      const vaccinationExpiration = wrapper.getByTestId(
        "vaccinationExpirationInput"
      );
      fireEvent.change(vaccinationExpiration, {
        target: { value: "2020-06-30" }
      });

      const lotNumber = wrapper.getByTestId("lotNumberInput");
      fireEvent.change(lotNumber, { target: { value: "19876" } });

      const manufacturer = wrapper.getByTestId("manufacturerInput");
      fireEvent.change(manufacturer, { target: { value: "XYTR4" } });

      fireEvent.submit(wrapper.getByTestId("immunization-form"));
      expect(mockSavePatientImmunization).toBeCalled();

      const firstArgument = mockSavePatientImmunization.mock.calls[0][0];
      expectImmunization(
        firstArgument,
        undefined,
        "visitUuid",
        "4 Months",
        2,
        "19876"
      );

      const secondArgument = mockSavePatientImmunization.mock.calls[0][1];
      expect(secondArgument).toBe(patient.id);

      const thirdArgument = mockSavePatientImmunization.mock.calls[0][2];
      expect(thirdArgument).toBeUndefined();
    });
  });

  it("should have save button disabled unless data changed in edit mode", async () => {
    mockSavePatientImmunization.mockResolvedValue({ status: 200 });
    match.params = {
      immunizationObsUuid: "b9c21a82-aed3-11ea-b3de-0242ac130004",
      vaccineName: "Rotavirus",
      manufacturer: { display: "Organization/hl7" },
      expirationDate: "2018-12-15",
      vaccinationDate: "2018-06-18",
      lotNumber: "PT123F",
      sequence: [
        { sequenceLabel: "2 Months", sequenceNumber: 1 },
        { sequenceLabel: "4 Months", sequenceNumber: 2 },
        { sequenceLabel: "6 Months", sequenceNumber: 3 }
      ],
      currentDose: { sequenceLabel: "2 Months", sequenceNumber: 1 }
    };

    wrapper = render(
      <BrowserRouter>
        <ImmunizationsForm match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
      expect(wrapper.getByText("Save")).toBeDisabled();
    });
  });

  it("should enable save button when data is changed in edit mode", async () => {
    mockSavePatientImmunization.mockResolvedValue({ status: 200 });
    match.params = {
      immunizationObsUuid: "b9c21a82-aed3-11ea-b3de-0242ac130004",
      vaccineName: "Rotavirus",
      manufacturer: { display: "Organization/hl7" },
      expirationDate: "2018-12-15",
      vaccinationDate: "2018-06-18",
      lotNumber: "PT123F",
      sequence: [
        { sequenceLabel: "2 Months", sequenceNumber: 1 },
        { sequenceLabel: "4 Months", sequenceNumber: 2 },
        { sequenceLabel: "6 Months", sequenceNumber: 3 }
      ],
      currentDose: { sequenceLabel: "2 Months", sequenceNumber: 1 }
    };

    wrapper = render(
      <BrowserRouter>
        <ImmunizationsForm match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      const vaccinationDate = wrapper.getByTestId("vaccinationDateInput");
      fireEvent.change(vaccinationDate, { target: { value: "2020-06-15" } });
      expect(wrapper.getByText("Save")).toBeEnabled();
    });
  });

  it("makes a call to edit existing immnunization with sequence", async () => {
    mockSavePatientImmunization.mockResolvedValue({ status: 200 });
    match.params = {
      immunizationObsUuid: "b9c21a82-aed3-11ea-b3de-0242ac130004",
      vaccineName: "Rotavirus",
      vaccineUuid: "RotavirusUuid",
      manufacturer: "XYTR4",
      expirationDate: "2020-06-30",
      vaccinationDate: "2020-06-15",
      lotNumber: "PT123F",
      sequences: [
        { sequenceLabel: "2 Months", sequenceNumber: 1 },
        { sequenceLabel: "4 Months", sequenceNumber: 2 },
        { sequenceLabel: "6 Months", sequenceNumber: 3 }
      ],
      currentDose: { sequenceLabel: "2 Months", sequenceNumber: 1 }
    };

    wrapper = render(
      <BrowserRouter>
        <ImmunizationsForm match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      const lotNumber = wrapper.getByTestId("lotNumberInput");
      fireEvent.change(lotNumber, { target: { value: "12345" } });

      fireEvent.submit(wrapper.getByTestId("immunization-form"));
      expect(mockSavePatientImmunization).toBeCalled();

      const firstArgument = mockSavePatientImmunization.mock.calls[0][0];
      expectImmunization(
        firstArgument,
        "b9c21a82-aed3-11ea-b3de-0242ac130004",
        "visitUuid",
        "2 Months",
        1,
        "12345"
      );

      const secondArgument = mockSavePatientImmunization.mock.calls[0][1];
      expect(secondArgument).toBe(patient.id);

      const thirdArgument = mockSavePatientImmunization.mock.calls[0][2];
      expect(thirdArgument).toBe("b9c21a82-aed3-11ea-b3de-0242ac130004");
    });
  });
});

function expectImmunization(
  immunizationParam,
  immunizationObsUuid,
  expectedEncounterUuid,
  expectedSeries,
  sequenceNumber,
  expectedLotNumber
) {
  expect(immunizationParam.resource.resourceType).toBe("Immunization");
  expect(immunizationParam.resource.id).toBe(immunizationObsUuid);
  expect(immunizationParam.resource.vaccineCode.coding[0].display).toBe(
    "Rotavirus"
  );
  expect(immunizationParam.resource.vaccineCode.coding[0].code).toBe(
    "RotavirusUuid"
  );
  expect(immunizationParam.resource.patient.reference).toBe(
    `Patient/${patient.id}`
  );

  expect(immunizationParam.resource.encounter).toBeTruthy();
  expect(immunizationParam.resource.encounter.reference).toBe(
    `Encounter/${expectedEncounterUuid}`
  );

  expect(immunizationParam.resource.location).toBeTruthy();
  expect(immunizationParam.resource.location.reference).toBe(
    "Location/b1a8b05e-3542-4037-bbd3-998ee9c40574"
  );

  expect(immunizationParam.resource.performer[0].actor).toBeTruthy();
  expect(immunizationParam.resource.performer[0].actor.reference).toBe(
    "Practitioner/b1a8b05e-3542-4037-bbd3-998ee9c4057z"
  );

  expect(immunizationParam.resource.manufacturer.display).toBe("XYTR4");
  expect(immunizationParam.resource.lotNumber).toBe(expectedLotNumber);

  expect(immunizationParam.resource.protocolApplied[0].series).toBe(
    expectedSeries
  );
  expect(
    immunizationParam.resource.protocolApplied[0].doseNumberPositiveInt
  ).toBe(sequenceNumber);
  expect(immunizationParam.resource.occurrenceDateTime.toISOString()).toBe(
    dayjs("2020-06-15").toISOString()
  );
  expect(immunizationParam.resource.expirationDate.toISOString()).toBe(
    dayjs("2020-06-30").toISOString()
  );
}
