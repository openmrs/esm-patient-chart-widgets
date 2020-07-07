import { FHIRImmunizationBundle } from "../src/widgets/immunizations/immunization-domain";
import dayjs from "dayjs";

export const patient: fhir.Patient = {
  resourceType: "Patient",
  id: "8673ee4f-e2ab-4077-ba55-4980f408773e",
  extension: [
    {
      url:
        "http://fhir-es.transcendinsights.com/stu3/StructureDefinition/resource-date-created",
      valueDateTime: "2017-01-18T09:42:40+00:00"
    },
    {
      url:
        "https://purl.org/elab/fhir/StructureDefinition/Creator-crew-version1",
      valueString: "daemon"
    }
  ],
  identifier: [
    {
      id: "1f0ad7a1-430f-4397-b571-59ea654a52db",
      use: "usual",
      system: "",
      value: "10010W"
    }
  ],
  active: true,
  name: [
    {
      id: "efdb246f-4142-4c12-a27a-9be60b9592e9",
      use: "usual",
      family: "Wilson",
      given: ["John"]
    }
  ],
  gender: "male",
  birthDate: "1972-04-04",
  deceasedBoolean: false,
  address: [
    {
      id: "0c244eae-85c8-4cc9-b168-96b51f864e77",
      use: "home",
      line: ["Address10351"],
      city: "City0351",
      state: "State0351tested",
      postalCode: "60351",
      country: "Country0351"
    }
  ]
};

export const mockImmunizationConfig = {
  immunizationsConfig: {
    vaccinesConceptSet: "vaccinationsUuid",
    sequencesDefinition: [
      {
        vaccineConceptUuid: "RotavirusUuid",
        sequences: [
          {
            sequenceLabel: "dose-1",
            sequenceNumber: "1"
          },
          {
            sequenceLabel: "dose-2",
            sequenceNumber: "2"
          },
          {
            sequenceLabel: "booster-1",
            sequenceNumber: "11"
          }
        ]
      },
      {
        vaccineConceptUuid: "PolioUuid",
        sequences: [
          {
            sequenceLabel: "2 Months",
            sequenceNumber: "1"
          },
          {
            sequenceLabel: "6 Months",
            sequenceNumber: "2"
          },
          {
            sequenceLabel: "8 Months",
            sequenceNumber: "2"
          }
        ]
      }
    ]
  }
};

export const mockVaccinesConceptSet = {
  setMembers: [
    {
      uuid: "RotavirusUuid",
      display: "Rotavirus"
    },
    {
      uuid: "PolioUuid",
      display: "Polio"
    },
    {
      uuid: "InfluenzaUuid",
      display: "Influenza"
    },
    {
      uuid: "AdinovirusUuid",
      display: "Adinovirus"
    }
  ]
};

export const mockPatientImmunization = {
  resource: {
    resourceType: "Immunization",
    id: "protocol",
    uuid: "b9c21a82-aed3-11ea-b3de-0242ac130004",
    vaccineCode: {
      coding: [
        {
          system: "",
          code: "104"
        }
      ],
      text: "Rotavirus"
    },
    patient: {
      reference: "Patient/D1A903924D4443A7A388778D77D86155"
    },
    encounter: {
      reference: "Encounter/example"
    },
    occurrenceDateTime: "2018-06-18",
    location: {
      reference: "Location/1"
    },
    manufacturer: {
      reference: "Organization/hl7"
    },
    lotNumber: "PT123F",
    expirationDate: "2018-12-15",
    protocolApplied: [
      {
        series: "2 Months",
        occurrenceDateTime: "2018-06-18",
        doseNumberPositiveInt: 1
      },
      {
        series: "4 Months",
        occurrenceDateTime: "2018-09-21",
        doseNumberPositiveInt: 2
      }
    ]
  }
};

export const mockPatientImmunizationWithSeries = {
  resource: {
    resourceType: "Immunization",
    id: "b9c21a82-aed3-11ea-b3de-0242ac130004",
    vaccineCode: {
      coding: [
        {
          system: "",
          code: "uuid1",
          display: "Rotavirus"
        }
      ]
    },
    patient: {
      reference: "Patient/D1A903924D4443A7A388778D77D86155"
    },
    encounter: {
      reference: "Encounter/example"
    },
    occurrenceDateTime: "2018-06-18",
    location: {
      reference: "Location/1"
    },
    manufacturer: {
      reference: "Organization/hl7"
    },
    isSeries: true,
    series: [
      { label: "2 Months", value: 1 },
      { label: "4 Months", value: 2 },
      { label: "6 Months", value: 3 }
    ],
    lotNumber: "PT123F",
    expirationDate: "2018-12-15",
    protocolApplied: [
      {
        series: "2 Months",
        occurrenceDateTime: "2018-06-18",
        doseNumberPositiveInt: 1
      }
    ]
  }
};

export const mockPatientImmunizationWithoutSeries = {
  resource: {
    resourceType: "Immunization",
    id: "b9c21a82-aed3-11ea-b3de-0242ac130004",
    vaccineCode: {
      coding: [
        {
          system: "",
          code: "uuid1",
          display: "Rotavirus"
        }
      ]
    },
    patient: {
      reference: "Patient/D1A903924D4443A7A388778D77D86155"
    },
    encounter: {
      reference: "Encounter/example"
    },
    occurrenceDateTime: "2018-06-18",
    location: {
      reference: "Location/1"
    },
    manufacturer: {
      reference: "Organization/hl7"
    },
    lotNumber: "PT123F",
    expirationDate: "2018-12-15",
    isSeries: false,
    protocolApplied: [
      {
        occurrenceDateTime: "2018-06-18",
        doseNumberPositiveInt: 1
      }
    ]
  }
};

export const mockPatientImmunizationsSearchResponse: FHIRImmunizationBundle = {
  resourceType: "Bundle",
  id: "b6f39678-aed3-11ea-b3de-0242ac130004",
  type: "searchset",
  total: 5,
  entry: [
    {
      resource: {
        resourceType: "Immunization",
        id: "b9c21a82-aed3-11ea-b3de-0242ac130001",
        vaccineCode: {
          coding: [
            {
              system: "",
              code: "RotavirusUuid",
              display: "Rotavirus"
            }
          ]
        },
        patient: {
          id: "D1A903924D4443A7A388778D77D86155"
        },
        encounter: {
          id: "Encounter/example"
        },
        occurrenceDateTime: dayjs("2018-09-21").toDate(),
        expirationDate: dayjs("2025-12-15").toDate(),
        location: {
          id: "Location/1"
        },
        manufacturer: {
          display: "Organization/hl7"
        },
        lotNumber: 12345,
        protocolApplied: [
          {
            series: "4 Months",
            doseNumberPositiveInt: 2
          }
        ]
      }
    },
    {
      resource: {
        resourceType: "Immunization",
        id: "b9c21a82-aed3-11ea-b3de-0242ac130001",
        status: "Completed",
        vaccineCode: {
          coding: [
            {
              system: "",
              code: "RotavirusUuid",
              display: "Rotavirus"
            }
          ]
        },
        patient: {
          id: "Patient/D1A903924D4443A7A388778D77D86155"
        },
        encounter: {
          id: "Encounter/example"
        },
        occurrenceDateTime: dayjs("2018-06-18").toDate(),
        expirationDate: dayjs("2025-12-15").toDate(),
        location: {
          id: "Location/1"
        },
        manufacturer: {
          display: "Organization/hl7"
        },
        lotNumber: 12345,
        protocolApplied: [
          {
            series: "2 Months",
            doseNumberPositiveInt: 1
          }
        ]
      }
    },
    {
      resource: {
        resourceType: "Immunization",
        id: "protocol",
        uuid: "b9c21d5c-aed3-11ea-b3de-0242ac130002",
        status: "Completed",
        vaccineCode: {
          coding: [
            {
              system: "",
              code: "PolioUuid",
              display: "Polio"
            }
          ]
        },
        patient: {
          id: "D1A903924D4443A7A388778D77D86155"
        },
        encounter: {
          id: "Encounter/example"
        },
        location: {
          id: "Location/1"
        },
        manufacturer: {
          display: "Organization/hl7"
        },
        lotNumber: 12345,
        occurrenceDateTime: dayjs("2018-05-21").toDate(),
        expirationDate: dayjs("2025-12-15").toDate(),
        isSeries: true,
        protocolApplied: [
          {
            series: "2 Months",
            doseNumberPositiveInt: 1
          }
        ]
      }
    },
    {
      resource: {
        resourceType: "Immunization",
        id: "protocol",
        uuid: "b9c21d5c-aed3-11ea-b3de-0242ac130002",
        status: "Completed",
        vaccineCode: {
          coding: [
            {
              system: "",
              code: "PolioUuid",
              display: "Polio"
            }
          ]
        },
        patient: {
          id: "D1A903924D4443A7A388778D77D86155"
        },
        encounter: {
          id: "Encounter/example"
        },
        location: {
          id: "Location/1"
        },
        manufacturer: {
          display: "Organization/hl7"
        },
        lotNumber: 1234,
        occurrenceDateTime: dayjs("2018-11-01").toDate(),
        expirationDate: dayjs("2025-12-15").toDate(),
        protocolApplied: [
          {
            series: "4 Months",
            doseNumberPositiveInt: 2
          }
        ]
      }
    },
    {
      resource: {
        resourceType: "Immunization",
        id: "historical",
        uuid: "b9c21e6a-aed3-11ea-b3de-0242ac130003",
        status: "Completed",
        vaccineCode: {
          coding: [
            {
              system: "",
              code: "InfluenzaUuid",
              display: "Influenza"
            }
          ]
        },
        patient: {
          id: "D1A903924D4443A7A388778D77D86155"
        },
        encounter: {
          id: "Encounter/example"
        },
        location: {
          id: "Location/1"
        },
        manufacturer: {
          display: "Organization/hl7"
        },
        lotNumber: 12345,
        occurrenceDateTime: dayjs("2018-05-21").toDate(),
        expirationDate: dayjs("2025-12-15").toDate(),
        protocolApplied: [
          {
            doseNumberPositiveInt: 1
          }
        ]
      }
    },
    {
      resource: {
        resourceType: "Immunization",
        id: "historical",
        uuid: "b9c21e6a-aed3-11ea-b3de-0242ac130003",
        status: "Completed",
        vaccineCode: {
          coding: [
            {
              system: "",
              code: "InfluenzaUuid",
              display: "Influenza"
            }
          ]
        },
        patient: {
          id: "D1A903924D4443A7A388778D77D86155"
        },
        encounter: {
          id: "Encounter/example"
        },
        location: {
          id: "Location/1"
        },
        manufacturer: {
          display: "Organization/hl7"
        },
        lotNumber: 12345,
        occurrenceDateTime: dayjs("2018-05-21").toDate(),
        expirationDate: dayjs("2025-12-15").toDate(),
        protocolApplied: [
          {
            doseNumberPositiveInt: 1
          }
        ]
      }
    }
  ]
};
