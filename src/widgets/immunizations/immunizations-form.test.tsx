import React from "react";
import { BrowserRouter } from "react-router-dom";
import { cleanup, fireEvent, render, wait } from "@testing-library/react";
import { useCurrentPatient } from "@openmrs/esm-api";
import { patient } from "../../../__mocks__/immunizations.mock";
import { ImmunizationsForm } from "./immunizations-form.component";
import { savePatientImmunization } from "./immunizations.resource";

const mockUseCurrentPatient = useCurrentPatient as jest.Mock;
const mockSavePatientImmunization = savePatientImmunization as jest.Mock;

jest.mock("@openmrs/esm-api", () => ({
  useCurrentPatient: jest.fn()
}));

jest.mock("./immunizations.resource", () => ({
  savePatientImmunization: jest.fn()
}));

describe("<ImmunizationsForm />", () => {
  let match = { params: {}, isExact: false, path: "/", url: "/" };
  let wrapper: any;

  mockUseCurrentPatient.mockReturnValue([false, patient, patient.id, null]);
  afterEach(cleanup);
  afterEach(mockSavePatientImmunization.mockReset);

  it("renders immunization form without dying", async () => {
    match.params = [
      {
        vaccineName: "Rotavirus",
        manufacturer: { reference: "Organization/hl7" },
        expirationDate: "",
        vaccinationDate: "",
        lotNumber: "",
        isSeries: false
      }
    ];
    wrapper = render(
      <BrowserRouter>
        <ImmunizationsForm match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
    });
  });

  it("displays the appropriate fields when adding a new immunization without series", async () => {
    match.params = [
      {
        vaccineName: "Rotavirus",
        manufacturer: {
          reference: "Organization/hl7"
        },
        expirationDate: "",
        vaccinationDate: "",
        lotNumber: "",
        isSeries: false
      }
    ];
    wrapper = render(
      <BrowserRouter>
        <ImmunizationsForm match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
      expect(wrapper.getByText("add Vaccine: Rotavirus")).toBeDefined();
      expect(wrapper.queryByText("Series")).toBeNull();
      expect(wrapper.getByText("vaccination Date")).toBeDefined();
      expect(wrapper.getByText("expiration Date")).toBeDefined();
      expect(wrapper.getByText("lot number")).toBeDefined();
      expect(wrapper.getByText("manufacturer")).toBeDefined();
      expect(wrapper.getByText("cancel")).toBeDefined();
      expect(wrapper.getByText("save")).toBeDefined();
    });
  });

  it("displays the appropriate fields when adding a new immunization with series", async () => {
    match.params = [
      {
        immunizationObsUuid: "",
        vaccineName: "Rotavirus",
        manufacturer: { reference: "Organization/hl7" },
        expirationDate: "",
        vaccinationDate: "",
        lotNumber: "",
        isSeries: true,
        series: [
          { label: "2 Months", value: 1 },
          { label: "4 Months", value: 2 },
          { label: "6 Months", value: 3 }
        ]
      }
    ];
    wrapper = render(
      <BrowserRouter>
        <ImmunizationsForm match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
      expect(wrapper.getByText("add Vaccine: " + "Rotavirus")).toBeDefined();
      expect(wrapper.getByText("vaccination Date")).toBeDefined();
      expect(wrapper.getByText("expiration Date")).toBeDefined();
      expect(wrapper.getByText("lot number")).toBeDefined();
      expect(wrapper.getByText("series")).toBeDefined();
      expect(wrapper.getByText("manufacturer")).toBeDefined();
      expect(wrapper.getByText("cancel")).toBeDefined();
      expect(wrapper.getByText("save")).toBeDefined();
    });
  });

  it("displays the appropriate fields and values when editing an existing immunization without series", async () => {
    match.params = [
      {
        immunizationObsUuid: "b9c21a82-aed3-11ea-b3de-0242ac130004",
        vaccineName: "Rotavirus",
        manufacturer: "Organization/hl7",
        expirationDate: "2018-12-15",
        vaccinationDate: "2018-06-18",
        lotNumber: "12345",
        isSeries: false
      }
    ];
    wrapper = render(
      <BrowserRouter>
        <ImmunizationsForm match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
      expect(wrapper.getByText("edit vaccine: Rotavirus")).toBeDefined();
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
      expect(wrapper.getByText("cancel")).toBeDefined();
      expect(wrapper.getByText("save")).toBeDefined();
    });
  });

  it("displays the appropriate fields and values when editing an existing immunization with series", async () => {
    match.params = [
      {
        immunizationObsUuid: "b9c21a82-aed3-11ea-b3de-0242ac130004",
        vaccineName: "Rotavirus",
        manufacturer: "Organization/hl7",
        expirationDate: "2018-12-15",
        vaccinationDate: "2018-06-18",
        lotNumber: "12345",
        isSeries: true,
        series: [
          { label: "2 Months", value: 1 },
          { label: "4 Months", value: 2 },
          { label: "6 Months", value: 3 }
        ],
        currentDose: { label: "2 Months", value: 1 }
      }
    ];
    wrapper = render(
      <BrowserRouter>
        <ImmunizationsForm match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
      expect(wrapper.getByText("edit vaccine: Rotavirus")).toBeDefined();
      expect(wrapper.getByText("2 Months").value).toBeDefined();
      expect(wrapper.getByLabelText("series").value).toBe("1");
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
      expect(wrapper.getByText("cancel")).toBeDefined();
      expect(wrapper.getByText("save")).toBeDefined();
    });
  });

  it("should have save button disabled unless data entered", async () => {
    mockSavePatientImmunization.mockResolvedValue({ status: 200 });
    match.params = [
      {
        vaccineName: "Rotavirus",
        isSeries: false
      }
    ];
    wrapper = render(
      <BrowserRouter>
        <ImmunizationsForm match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
      expect(wrapper.getByText("save")).toBeDisabled();
    });
  });

  it("should enable save button when mandatory fields are selected", async () => {
    mockSavePatientImmunization.mockResolvedValue({ status: 200 });
    match.params = [
      {
        vaccineName: "Rotavirus",
        isSeries: false
      }
    ];
    wrapper = render(
      <BrowserRouter>
        <ImmunizationsForm match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      const vaccinationDate = wrapper.getByTestId("vaccinationDateInput");
      fireEvent.change(vaccinationDate, { target: { value: "2020-06-15" } });
      expect(wrapper.getByText("save")).toBeEnabled();
    });
  });

  it("makes a call to create new immnunization without series", async () => {
    mockSavePatientImmunization.mockResolvedValue({ status: 200 });
    match.params = [
      {
        vaccineName: "Rotavirus",
        vaccineUuid: "RotavirusUuid",
        isSeries: false
      }
    ];
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
      fireEvent.change(lotNumber, { target: { value: "09876" } });

      const manufacturer = wrapper.getByTestId("manufacturerInput");
      fireEvent.change(manufacturer, { target: { value: "XYTR4" } });

      fireEvent.submit(wrapper.getByTestId("immunization-form"));
      expect(mockSavePatientImmunization).toBeCalled();

      const firstArgument = mockSavePatientImmunization.mock.calls[0][0];
      expectImmunization(
        firstArgument,
        undefined,
        undefined,
        undefined,
        undefined,
        "09876"
      );

      const secondArgument = mockSavePatientImmunization.mock.calls[0][1];
      expect(secondArgument).toBe(patient.id);

      const thirdArgument = mockSavePatientImmunization.mock.calls[0][2];
      expect(thirdArgument).toBeUndefined();
    });
  });

  it("makes a call to create new immnunization with series", async () => {
    mockSavePatientImmunization.mockResolvedValue({ status: 200 });
    match.params = [
      {
        vaccineName: "Rotavirus",
        vaccineUuid: "RotavirusUuid",
        isSeries: true,
        series: [
          { label: "2 Months", value: 1 },
          { label: "4 Months", value: 2 },
          { label: "6 Months", value: 3 }
        ]
      }
    ];
    wrapper = render(
      <BrowserRouter>
        <ImmunizationsForm match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      const series = wrapper.getByLabelText("series");
      fireEvent.change(series, { target: { value: 2 } });

      const vaccinationDate = wrapper.getByTestId("vaccinationDateInput");
      fireEvent.change(vaccinationDate, { target: { value: "2020-06-15" } });

      const vaccinationExpiration = wrapper.getByTestId(
        "vaccinationExpirationInput"
      );
      fireEvent.change(vaccinationExpiration, {
        target: { value: "2020-06-30" }
      });

      const lotNumber = wrapper.getByTestId("lotNumberInput");
      fireEvent.change(lotNumber, { target: { value: "09876" } });

      const manufacturer = wrapper.getByTestId("manufacturerInput");
      fireEvent.change(manufacturer, { target: { value: "XYTR4" } });

      fireEvent.submit(wrapper.getByTestId("immunization-form"));
      expect(mockSavePatientImmunization).toBeCalled();

      const firstArgument = mockSavePatientImmunization.mock.calls[0][0];
      expectImmunization(
        firstArgument,
        undefined,
        undefined,
        "4 Months",
        2,
        "09876"
      );

      const secondArgument = mockSavePatientImmunization.mock.calls[0][1];
      expect(secondArgument).toBe(patient.id);

      const thirdArgument = mockSavePatientImmunization.mock.calls[0][2];
      expect(thirdArgument).toBeUndefined();
    });
  });
  it("should have save button disabled unless data changed in edit mode", async () => {
    mockSavePatientImmunization.mockResolvedValue({ status: 200 });
    match.params = [
      {
        immunizationObsUuid: "b9c21a82-aed3-11ea-b3de-0242ac130004",
        vaccineName: "Rotavirus",
        manufacturer: { reference: "Organization/hl7" },
        expirationDate: "2018-12-15",
        vaccinationDate: "2018-06-18",
        lotNumber: "PT123F",
        isSeries: true,
        series: [
          { label: "2 Months", value: 1 },
          { label: "4 Months", value: 2 },
          { label: "6 Months", value: 3 }
        ],
        currentDose: { label: "2 Months", value: 1 }
      }
    ];
    wrapper = render(
      <BrowserRouter>
        <ImmunizationsForm match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
      expect(wrapper.getByText("save")).toBeDisabled();
    });
  });

  it("should enable save button when data is changed in edit mode", async () => {
    mockSavePatientImmunization.mockResolvedValue({ status: 200 });
    match.params = [
      {
        immunizationObsUuid: "b9c21a82-aed3-11ea-b3de-0242ac130004",
        vaccineName: "Rotavirus",
        manufacturer: { reference: "Organization/hl7" },
        expirationDate: "2018-12-15",
        vaccinationDate: "2018-06-18",
        lotNumber: "PT123F",
        isSeries: true,
        series: [
          { label: "2 Months", value: 1 },
          { label: "4 Months", value: 2 },
          { label: "6 Months", value: 3 }
        ],
        currentDose: { label: "2 Months", value: 1 }
      }
    ];
    wrapper = render(
      <BrowserRouter>
        <ImmunizationsForm match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      const vaccinationDate = wrapper.getByTestId("vaccinationDateInput");
      fireEvent.change(vaccinationDate, { target: { value: "2020-06-15" } });
      expect(wrapper.getByText("save")).toBeEnabled();
    });
  });

  it("makes a call to edit existing immnunization with series", async () => {
    mockSavePatientImmunization.mockResolvedValue({ status: 200 });
    match.params = [
      {
        immunizationObsUuid: "b9c21a82-aed3-11ea-b3de-0242ac130004",
        encounterUuid: "b9c21a82-aed3-11ea-b3de-0242ac130007",
        vaccineName: "Rotavirus",
        vaccineUuid: "RotavirusUuid",
        manufacturer: "XYTR4",
        expirationDate: "2020-06-30",
        vaccinationDate: "2020-06-15",
        lotNumber: "PT123F",
        isSeries: true,
        series: [
          { label: "2 Months", value: 1 },
          { label: "4 Months", value: 2 },
          { label: "6 Months", value: 3 }
        ],
        currentDose: { label: "2 Months", value: 1 }
      }
    ];
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
        "b9c21a82-aed3-11ea-b3de-0242ac130007",
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
  doseNumber,
  expectedLotNumer: string
) {
  expect(immunizationParam.resource.resourceType).toBe("Immunization");
  expect(immunizationParam.resource.id).toBe(immunizationObsUuid);
  expect(immunizationParam.resource.vaccineCode.coding[0].display).toBe(
    "Rotavirus"
  );
  expect(immunizationParam.resource.vaccineCode.coding[0].code).toBe(
    "RotavirusUuid"
  );
  expect(immunizationParam.resource.patient.id).toBe(patient.id);

  expect(immunizationParam.resource.encounter).toBeTruthy();
  expect(immunizationParam.resource.encounter.id).toBe(expectedEncounterUuid);

  expect(immunizationParam.resource.location).toBeTruthy();
  expect(immunizationParam.resource.manufacturer.reference).toBe("XYTR4");
  expect(immunizationParam.resource.lotNumber).toBe(expectedLotNumer);

  expect(immunizationParam.resource.protocolApplied[0].protocol.series).toBe(
    expectedSeries
  );
  expect(
    immunizationParam.resource.protocolApplied[0].protocol.doseNumberPositiveInt
  ).toBe(doseNumber);
  expect(
    immunizationParam.resource.protocolApplied[0].protocol.occurrenceDateTime
  ).toBe("2020-06-15");
  expect(
    immunizationParam.resource.protocolApplied[0].protocol.expirationDate
  ).toBe("2020-06-30");
}