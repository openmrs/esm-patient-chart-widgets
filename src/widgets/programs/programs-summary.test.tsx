import React from "react";
import { cleanup, render, wait } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ProgramsSummary from "./programs-summary.component";
import { mockPatient } from "../../../__mocks__/patient.mock";
import { mockEnrolledProgramsResponse } from "../../../__mocks__/programs.mock";
import { useCurrentPatient } from "../../../__mocks__/openmrs-esm-api.mock";
import { fetchEnrolledPrograms } from "./programs.resource";
import { of } from "rxjs/internal/observable/of";

const mockFetchEnrolledPrograms = fetchEnrolledPrograms as jest.Mock;
const mockUseCurrentPatient = useCurrentPatient as jest.Mock;

jest.mock("./programs.resource", () => ({
  fetchEnrolledPrograms: jest.fn()
}));

jest.mock("@openmrs/esm-api", () => ({
  useCurrentPatient: jest.fn()
}));

describe("<ProgramsSummary />", () => {
  let match = { params: {}, isExact: false, path: "/", url: "/" };
  let wrapper: any;

  afterEach(cleanup);
  beforeEach(() => {
    mockUseCurrentPatient.mockReturnValue([
      false,
      mockPatient,
      mockPatient.id,
      null
    ]);
  });

  it("renders without dying", async () => {
    mockFetchEnrolledPrograms.mockReturnValue(of(mockEnrolledProgramsResponse));

    wrapper = render(
      <BrowserRouter>
        <ProgramsSummary match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
    });
  });

  it("displays the patient's care programs correctly", async () => {
    mockFetchEnrolledPrograms.mockReturnValue(of(mockEnrolledProgramsResponse));

    wrapper = render(
      <BrowserRouter>
        <ProgramsSummary match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
      expect(wrapper.getByText("Care Programs").textContent).toBeTruthy();
      expect(wrapper.getByText("ACTIVE PROGRAMS").textContent).toBeTruthy();
      expect(wrapper.getByText("SINCE").textContent).toBeTruthy();
      expect(wrapper.getByText("STATUS").textContent).toBeTruthy();
      expect(
        wrapper.getByText("HIV Care and Treatment").textContent
      ).toBeTruthy();
      expect(wrapper.getByText("Jan-2020").textContent).toBeTruthy();
      expect(wrapper.getByText("Active").textContent).toBeTruthy();
    });
  });

  xit("should not render programs when the patient is not enrolled into any", async () => {
    mockFetchEnrolledPrograms.mockReturnValue(of({}));

    wrapper = render(
      <BrowserRouter>
        <ProgramsSummary match={match} />
      </BrowserRouter>
    );

    await wait(() => {
      expect(wrapper).toBeDefined();
      expect(wrapper.getByText("Care Programs").textContent).toBeTruthy();
      expect(wrapper.getByTestId("no-programs").textContent).toBe(
        "Program data will appear here once the patient enrolls into a program."
      );
      expect(wrapper.getByText("Enroll into program").textContent).toBeTruthy();
    });
  });
});
