import React from "react";
import { BrowserRouter } from "react-router-dom";
import { render, cleanup, wait, RenderResult } from "@testing-library/react";
import { mockPatient } from "../../../__mocks__/patient.mock";
import {
  mockPatientEncounters,
  mockPatientEncountersRESTAPI
} from "../../../__mocks__/encounters.mock";
import {
  getEncounters,
  getEncounterObservableRESTAPI
} from "./encounter.resource";
import NotesOverview from "./notes-overview.component";
import { useCurrentPatient } from "@openmrs/esm-api";
import { formatNotesDate, getAuthorName } from "./notes-helper";
import { of } from "rxjs";

const mockFetchPatientEncounters = getEncounters as jest.Mock;
const mockUseCurrentPatient = useCurrentPatient as jest.Mock;
const mockGetEncounterObservableRESTAPI = getEncounterObservableRESTAPI as jest.Mock;

jest.mock("./encounter.resource", () => ({
  getEncounters: jest.fn(),
  getEncounterObservableRESTAPI: jest.fn()
}));

jest.mock("@openmrs/esm-api", () => ({
  useCurrentPatient: jest.fn()
}));

describe("<NotesOverview/>", () => {
  afterEach(cleanup);

  beforeEach(mockGetEncounterObservableRESTAPI.mockReset);
  beforeEach(
    mockUseCurrentPatient.mockReturnValue([
      false,
      mockPatient,
      mockPatient.id,
      null
    ])
  );

  it("renders successfully", () => {
    mockGetEncounterObservableRESTAPI.mockReturnValue(
      of(mockPatientEncountersRESTAPI)
    );
    render(
      <BrowserRouter>
        <NotesOverview basePath="/" />
      </BrowserRouter>
    );
  });

  it("renders an empty state view when dimensions are absent", async () => {
    mockGetEncounterObservableRESTAPI.mockReturnValue(of([]));

    const wrapper = render(
      <BrowserRouter>
        <NotesOverview basePath="/" />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
      expect(wrapper.getByText("Notes").textContent).toBeTruthy();
      expect(
        wrapper.getByText("This patient has no notes recorded in the system.")
          .textContent
      ).toBeTruthy();
    });
  });

  it("displays see more on the footer", async () => {
    mockGetEncounterObservableRESTAPI.mockReturnValue(
      of(mockPatientEncountersRESTAPI.results)
    );

    const wrapper: RenderResult = render(
      <BrowserRouter>
        <NotesOverview basePath="/" />
      </BrowserRouter>
    );
    await wait(() => {
      expect(wrapper.getByText("See all")).not.toBeNull();
    });
  });

  it("displays notes correctly", async () => {
    mockGetEncounterObservableRESTAPI.mockReturnValue(
      of(mockPatientEncountersRESTAPI.results)
    );

    const wrapper = render(
      <BrowserRouter>
        <NotesOverview basePath="/" />
      </BrowserRouter>
    );

    await wait(() => {
      const tbody = wrapper.container.querySelector("tbody");
      const firstRow = tbody.children[0];
      const secondRow = tbody.children[2];
      expect(firstRow.children[0].textContent).toBeTruthy();
      expect(firstRow.children[1].textContent).toContain("Vitals");
      expect(firstRow.children[1].textContent).toContain("Isolation Ward");
      expect(firstRow.children[2].textContent).toBe("JJ Dick");
      expect(secondRow.children[2].textContent).toBe("—");
    });
  });

  it("renders Encounter if not changed with original provider", () => {
    const mockNote = {
      participant: [
        {
          individual: {
            reference: "Practitioner/f9badd80-ab76-11e2-9e96-0800200c9a66",
            display: "Super User(Identifier:ADMIN)"
          }
        }
      ]
    };
    expect(getAuthorName(mockNote)).toBe(`SUPER USER(IDENTIFIER:ADMIN)`);
  });

  it("renders changed Encounter as with new provider", () => {
    const mocknote = {
      extension: [
        {
          url: "dateChanged",
          valueDateTime: "2017-01-18T09:02:37+00:00"
        },
        { url: "changedBy", valueString: "daemon" },
        {
          url: "formUuid",
          valueString: "c75f120a-04ec-11e3-8780-2b40bef9a44b"
        }
      ]
    };
    expect(getAuthorName(mocknote)).toBe(`DAEMON`);
  });

  it("renders dates according to designs", () => {
    const today = new Date();
    const sometimeLastYear = `${today.getFullYear() - 1}-11-13T09:32:14`;
    const sometimeThisYear = `${today.getFullYear()}-04-26T06:49:00`;
    expect(formatNotesDate(sometimeLastYear)).toBe(
      `13-Nov-${today.getFullYear() - 1} 09:32 AM`
    );
    expect(formatNotesDate(sometimeThisYear)).toBe(`26-Apr 06:49 AM`);
  });
});
