/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useState, useEffect } from 'react';
import { useSafeFetch } from '../console/utils/safe-fetch-hook';
import { createAlertsQuery, fetchDataForIncidentsAndAlerts } from './api';
import { useTranslation } from 'react-i18next';
import {
  Bullseye,
  Button,
  Select,
  SelectList,
  SelectOption,
  Spinner,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  MenuToggle,
  PageSection,
  Stack,
  StackItem,
  ToolbarGroup,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { Helmet } from 'react-helmet';
import { IncidentsTable } from './IncidentsTable';
import {
  getIncidentsTimeRanges,
  processIncidents,
  processIncidentsForAlerts,
} from './processIncidents';
import {
  filterIncident,
  getIncidentIdOptions,
  onDeleteGroupIncidentFilterChip,
  onDeleteIncidentFilterChip,
  onIncidentFiltersSelect,
  parseUrlParams,
  updateBrowserUrl,
} from './utils';
import { groupAlertsForTable, processAlerts } from './processAlerts';
import { CompressArrowsAltIcon, CompressIcon, FilterIcon } from '@patternfly/react-icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  setAlertsAreLoading,
  setAlertsData,
  setAlertsTableData,
  setFilteredIncidentsData,
  setIncidentPageFilterType,
  setIncidents,
  setIncidentsActiveFilters,
} from '../../actions/observe';
import { useLocation } from 'react-router-dom';
import { getLegacyObserveState, usePerspective } from '../hooks/usePerspective';
import { changeDaysFilter } from './utils';
import { parsePrometheusDuration } from '../console/console-shared/src/datetime/prometheus';
import withFallback from '../console/console-shared/error/fallbacks/withFallback';
import IncidentsChart from './IncidentsChart/IncidentsChart';
import AlertsChart from './AlertsChart/AlertsChart';
import { usePatternFlyTheme } from '../hooks/usePatternflyTheme';
import { MonitoringState } from 'src/reducers/observe';
import { Incident, IncidentsPageFiltersExpandedState } from './model';
import { useAlertsPoller } from '../hooks/useAlertsPoller';
import { Rule } from '@openshift-console/dynamic-plugin-sdk';
import IncidentFilterToolbarItem, { severityOptions, stateOptions } from './ToolbarItemFilter';
import { DataTestIDs } from '../data-test';

const IncidentsPage = () => {
  const { t } = useTranslation(process.env.I18N_NAMESPACE);
  const dispatch = useDispatch();
  const location = useLocation();
  const urlParams = useMemo(() => parseUrlParams(location.search), [location.search]);
  const { perspective, rulesKey } = usePerspective();
  useAlertsPoller();
  const { theme } = usePatternFlyTheme();
  // loading states
  const [incidentsAreLoading, setIncidentsAreLoading] = useState(true);
  // days span is where we store the value for creating time ranges for
  // fetch incidents/alerts based on the length of time ranges
  // when days filter changes we set a new days span -> calculate new time range and fetch new data
  const [daysSpan, setDaysSpan] = useState<number>();
  const [timeRanges, setTimeRanges] = useState([]);
  // data that is used for processing to serve it to the alerts table and chart
  const [incidentForAlertProcessing, setIncidentForAlertProcessing] = useState<
    Array<Partial<Incident>>
  >([]);
  const [hideCharts, setHideCharts] = useState(false);

  const [filtersExpanded, setFiltersExpanded] = useState<IncidentsPageFiltersExpandedState>({
    severity: false,
    state: false,
    groupId: false,
  });

  const [filterTypeExpanded, setFilterTypeExpanded] = useState({
    filterType: false,
  });

  const onFilterToggle = (
    ev: React.MouseEvent,
    filterName: keyof IncidentsPageFiltersExpandedState | 'filterType',
    setter,
  ) => {
    ev.stopPropagation();
    setter((prevFilters) => ({
      ...prevFilters,
      [filterName]: !prevFilters[filterName],
    }));
  };

  const [daysFilterIsExpanded, setDaysFilterIsExpanded] = useState(false);

  const onToggleClick = (ev) => {
    ev.stopPropagation();
    setDaysFilterIsExpanded(!daysFilterIsExpanded);
  };

  const incidentsInitialState = useSelector((state: MonitoringState) =>
    state.plugins.mcp.getIn(['incidentsData', 'incidentsInitialState']),
  );

  const incidents = useSelector((state: MonitoringState) =>
    state.plugins.mcp.getIn(['incidentsData', 'incidents']),
  );

  const incidentsActiveFilters = useSelector((state: MonitoringState) =>
    state.plugins.mcp.getIn(['incidentsData', 'incidentsActiveFilters']),
  );
  const alertsData = useSelector((state: MonitoringState) =>
    state.plugins.mcp.getIn(['incidentsData', 'alertsData']),
  );
  const alertsAreLoading = useSelector((state: MonitoringState) =>
    state.plugins.mcp.getIn(['incidentsData', 'alertsAreLoading']),
  );

  const filteredData = useSelector((state: MonitoringState) =>
    state.plugins.mcp.getIn(['incidentsData', 'filteredIncidentsData']),
  );

  const incidentPageFilterTypeSelected = useSelector((state: MonitoringState) =>
    state.plugins.mcp.getIn(['incidentsData', 'incidentPageFilterType']),
  );

  const selectedGroupId = incidentsActiveFilters.groupId?.[0] ?? null;
  useEffect(() => {
    const hasUrlParams = Object.keys(urlParams).length > 0;
    if (hasUrlParams) {
      // If URL parameters exist, update incidentsActiveFilters based on them
      dispatch(
        setIncidentsActiveFilters({
          incidentsActiveFilters: {
            days: urlParams.days ? urlParams.days : ['7 days'],
            severity: urlParams.severity ? urlParams.severity : [],
            state: urlParams.state ? urlParams.state : [],
            groupId: urlParams.groupId ? urlParams.groupId : [],
          },
        }),
      );
    } else {
      // If no URL parameters exist, set the URL based on incidentsInitialState
      updateBrowserUrl(incidentsInitialState);
      dispatch(
        setIncidentsActiveFilters({
          incidentsActiveFilters: {
            ...incidentsInitialState,
          },
        }),
      );
    }
  }, []);

  useEffect(() => {
    updateBrowserUrl(incidentsActiveFilters, selectedGroupId);
  }, [incidentsActiveFilters]);

  useEffect(() => {
    dispatch(
      setFilteredIncidentsData({
        filteredIncidentsData: filterIncident(incidentsActiveFilters, incidents),
      }),
    );
  }, [
    incidentsActiveFilters.state,
    incidentsActiveFilters.severity,
    incidentsActiveFilters.groupId,
  ]);

  const now = Date.now();
  const safeFetch = useSafeFetch();
  const title = t('Incidents');

  useEffect(() => {
    setTimeRanges(getIncidentsTimeRanges(daysSpan, now));
  }, [daysSpan]);

  useEffect(() => {
    setDaysSpan(
      parsePrometheusDuration(
        incidentsActiveFilters.days.length > 0
          ? incidentsActiveFilters.days[0].split(' ')[0] + 'd'
          : '',
      ),
    );
  }, [incidentsActiveFilters.days]);

  useEffect(() => {
    (async () => {
      Promise.all(
        timeRanges.map(async (range) => {
          const response = await fetchDataForIncidentsAndAlerts(
            safeFetch,
            range,
            createAlertsQuery(incidentForAlertProcessing),
            perspective,
          );
          return response.data.result;
        }),
      )
        .then((results) => {
          const aggregatedData = results.flat();
          dispatch(
            setAlertsData({
              alertsData: processAlerts(aggregatedData, incidentForAlertProcessing),
            }),
          );
          dispatch(setAlertsAreLoading({ alertsAreLoading: false }));
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(err);
        });
    })();
  }, [incidentForAlertProcessing]);

  const alertingRulesData: Rule[] = useSelector((state: MonitoringState) =>
    getLegacyObserveState(perspective, state)?.get(rulesKey),
  );

  useEffect(() => {
    if (alertingRulesData && alertsData) {
      dispatch(
        setAlertsTableData({
          alertsTableData: groupAlertsForTable(alertsData, alertingRulesData),
        }),
      );
    }
  }, [alertsData, alertingRulesData]);

  useEffect(() => {
    (async () => {
      Promise.all(
        timeRanges.map(async (range) => {
          const response = await fetchDataForIncidentsAndAlerts(
            safeFetch,
            range,
            'cluster:health:components:map',
            perspective,
          );
          return response.data.result;
        }),
      )
        .then((results) => {
          const aggregatedData = results.flat();
          dispatch(
            setIncidents({
              incidents: processIncidents(aggregatedData),
            }),
          );
          dispatch(
            setFilteredIncidentsData({
              filteredIncidentsData: filterIncident(
                urlParams ? incidentsActiveFilters : incidentsInitialState,
                processIncidents(aggregatedData),
              ),
            }),
          );
          setIncidentsAreLoading(false);
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(err);
        });
    })();
  }, [timeRanges]);

  useEffect(() => {
    if (selectedGroupId) {
      Promise.all(
        timeRanges.map(async (range) => {
          const response = await fetchDataForIncidentsAndAlerts(
            safeFetch,
            range,
            `cluster:health:components:map{group_id='${selectedGroupId}'}`,
            perspective,
          );
          return response.data.result;
        }),
      )
        .then((results) => {
          const aggregatedData = results.flat();
          setIncidentForAlertProcessing(processIncidentsForAlerts(aggregatedData));
          dispatch(setAlertsAreLoading({ alertsAreLoading: true }));
          setIncidentsAreLoading(false);
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(err);
        });
    }
  }, [selectedGroupId, timeRanges]);

  const onSelect = (_event, value) => {
    if (value) {
      changeDaysFilter(value, dispatch, incidentsActiveFilters);
    }

    setDaysFilterIsExpanded(false);
  };

  const incidentIdFilterOptions = incidents ? getIncidentIdOptions(incidents) : [];

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <PageSection hasBodyWrapper={false}>
        {alertsAreLoading && incidentsAreLoading ? (
          <Bullseye>
            <Spinner
              aria-label="incidents-chart-spinner"
              data-test={DataTestIDs.IncidentsPage.LoadingSpinner}
            />
          </Bullseye>
        ) : (
          <PageSection hasBodyWrapper={false} className="incidents-page-main-section">
            <Toolbar
              id="toolbar-with-filter"
              data-test={DataTestIDs.IncidentsPage.Toolbar}
              collapseListedFiltersBreakpoint="xl"
              clearAllFilters={() => {
                dispatch(
                  setIncidentsActiveFilters({
                    incidentsActiveFilters: {
                      ...incidentsActiveFilters,
                      severity: [],
                      state: [],
                      groupId: [],
                    },
                  }),
                );
                dispatch(setAlertsAreLoading({ alertsAreLoading: true }));
              }}
            >
              <ToolbarContent>
                <ToolbarGroup>
                  <ToolbarItem>
                    <Select
                      aria-label="Filter type selection"
                      data-test={DataTestIDs.IncidentsPage.FiltersSelect}
                      isOpen={filterTypeExpanded.filterType}
                      role="menu"
                      selected={incidentPageFilterTypeSelected}
                      onOpenChange={(isOpen) =>
                        setFiltersExpanded((prev) => ({ ...prev, filterType: isOpen }))
                      }
                      onSelect={(event, selection) => {
                        dispatch(setIncidentPageFilterType({ incidentPageFilterType: selection }));
                        setFilterTypeExpanded((prev) => ({ ...prev, filterType: false }));
                      }}
                      shouldFocusToggleOnSelect
                      toggle={(toggleRef) => (
                        <MenuToggle
                          ref={toggleRef}
                          onClick={(ev) => onFilterToggle(ev, 'filterType', setFilterTypeExpanded)}
                          isExpanded={filterTypeExpanded.filterType}
                          icon={<FilterIcon />}
                          data-test={DataTestIDs.IncidentsPage.FiltersSelectToggle}
                        >
                          {incidentPageFilterTypeSelected}
                        </MenuToggle>
                      )}
                      style={{ width: '145px' }}
                    >
                      <SelectList data-test={DataTestIDs.IncidentsPage.FiltersSelectList}>
                        <SelectOption
                          value="Severity"
                          isSelected={incidentPageFilterTypeSelected?.includes('Severity')}
                          data-test={`${DataTestIDs.IncidentsPage.FiltersSelectOption}-severity`}
                        >
                          Severity
                        </SelectOption>
                        <SelectOption
                          value="State"
                          isSelected={incidentPageFilterTypeSelected?.includes('State')}
                          data-test={`${DataTestIDs.IncidentsPage.FiltersSelectOption}-state`}
                        >
                          State
                        </SelectOption>
                        <SelectOption
                          value="Incident ID"
                          isSelected={incidentPageFilterTypeSelected?.includes('Incident ID')}
                          data-test={`${DataTestIDs.IncidentsPage.FiltersSelectOption}-incident-id`}
                        >
                          Incident ID
                        </SelectOption>
                      </SelectList>
                    </Select>
                  </ToolbarItem>
                  <ToolbarItem
                    className={incidentPageFilterTypeSelected !== 'Severity' ? 'pf-m-hidden' : ''}
                  >
                    <IncidentFilterToolbarItem
                      categoryName="Severity"
                      toggleLabel="Severity filters"
                      options={severityOptions}
                      incidentsActiveFilters={incidentsActiveFilters}
                      onDeleteIncidentFilterChip={onDeleteIncidentFilterChip}
                      onDeleteGroupIncidentFilterChip={onDeleteGroupIncidentFilterChip}
                      incidentFilterIsExpanded={filtersExpanded.severity}
                      onIncidentFiltersSelect={onIncidentFiltersSelect}
                      setIncidentIsExpanded={(isExpanded) =>
                        setFiltersExpanded((prev) => ({ ...prev, severity: isExpanded }))
                      }
                      onIncidentFilterToggle={(ev) =>
                        onFilterToggle(ev, 'severity', setFiltersExpanded)
                      }
                      dispatch={dispatch}
                      showToolbarItem={incidentPageFilterTypeSelected?.includes('Severity')}
                    />
                  </ToolbarItem>
                  <ToolbarItem
                    className={incidentPageFilterTypeSelected !== 'State' ? 'pf-m-hidden' : ''}
                  >
                    <IncidentFilterToolbarItem
                      categoryName="State"
                      toggleLabel="State filters"
                      options={stateOptions}
                      incidentsActiveFilters={incidentsActiveFilters}
                      onDeleteIncidentFilterChip={onDeleteIncidentFilterChip}
                      onDeleteGroupIncidentFilterChip={onDeleteGroupIncidentFilterChip}
                      incidentFilterIsExpanded={filtersExpanded.state}
                      onIncidentFiltersSelect={onIncidentFiltersSelect}
                      setIncidentIsExpanded={(isExpanded) =>
                        setFiltersExpanded((prev) => ({ ...prev, state: isExpanded }))
                      }
                      onIncidentFilterToggle={(ev) =>
                        onFilterToggle(ev, 'state', setFiltersExpanded)
                      }
                      dispatch={dispatch}
                      showToolbarItem={incidentPageFilterTypeSelected?.includes('State')}
                    />
                  </ToolbarItem>
                  <ToolbarItem
                    className={
                      incidentPageFilterTypeSelected !== 'Incident ID' ? 'pf-m-hidden' : ''
                    }
                  >
                    <IncidentFilterToolbarItem
                      categoryName="Incident ID"
                      toggleLabel="Incident ID filters"
                      options={incidentIdFilterOptions}
                      incidentsActiveFilters={incidentsActiveFilters}
                      onDeleteIncidentFilterChip={onDeleteIncidentFilterChip}
                      onDeleteGroupIncidentFilterChip={onDeleteGroupIncidentFilterChip}
                      incidentFilterIsExpanded={filtersExpanded.groupId}
                      onIncidentFiltersSelect={onIncidentFiltersSelect}
                      setIncidentIsExpanded={(isExpanded) =>
                        setFiltersExpanded((prev) => ({ ...prev, groupId: isExpanded }))
                      }
                      onIncidentFilterToggle={(ev) =>
                        onFilterToggle(ev, 'groupId', setFiltersExpanded)
                      }
                      dispatch={dispatch}
                      showToolbarItem={incidentPageFilterTypeSelected?.includes('Incident ID')}
                    />
                  </ToolbarItem>
                </ToolbarGroup>
                <ToolbarItem align={{ default: 'alignEnd' }}>
                  <Select
                    id="time-range-select"
                    data-test={DataTestIDs.IncidentsPage.DaysSelect}
                    isOpen={daysFilterIsExpanded}
                    selected={incidentsActiveFilters.days[0]}
                    onSelect={onSelect}
                    onOpenChange={(isOpen) => setDaysFilterIsExpanded(isOpen)}
                    toggle={(toggleRef) => (
                      <MenuToggle
                        ref={toggleRef}
                        onClick={onToggleClick}
                        isExpanded={daysFilterIsExpanded}
                        data-test={DataTestIDs.IncidentsPage.DaysSelectToggle}
                      >
                        {`Last ${incidentsActiveFilters.days[0]}`}
                      </MenuToggle>
                    )}
                    shouldFocusToggleOnSelect
                  >
                    <SelectList data-test={DataTestIDs.IncidentsPage.DaysSelectList}>
                      <SelectOption
                        value="1 day"
                        data-test={`${DataTestIDs.IncidentsPage.DaysSelectOption}-1-day`}
                      >
                        {t('Last 1 day')}
                      </SelectOption>
                      <SelectOption
                        value="3 days"
                        data-test={`${DataTestIDs.IncidentsPage.DaysSelectOption}-3-days`}
                      >
                        {t('Last 3 days')}
                      </SelectOption>
                      <SelectOption
                        value="7 days"
                        data-test={`${DataTestIDs.IncidentsPage.DaysSelectOption}-7-days`}
                      >
                        {t('Last 7 days')}
                      </SelectOption>
                      <SelectOption
                        value="15 days"
                        data-test={`${DataTestIDs.IncidentsPage.DaysSelectOption}-15-days`}
                      >
                        {t('Last 15 days')}
                      </SelectOption>
                    </SelectList>
                  </Select>
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>
            <Stack hasGutter>
              <StackItem>
                <Flex justifyContent={{ default: 'justifyContentFlexEnd' }}>
                  <FlexItem>
                    <Button
                      variant="link"
                      icon={hideCharts ? <CompressArrowsAltIcon /> : <CompressIcon />}
                      onClick={() => setHideCharts(!hideCharts)}
                      data-test={DataTestIDs.IncidentsPage.ToggleChartsButton}
                    >
                      <span>{hideCharts ? t('Show graph') : t('Hide graph')}</span>
                    </Button>
                  </FlexItem>
                </Flex>
              </StackItem>
              {!hideCharts && (
                <>
                  <StackItem>
                    <IncidentsChart
                      incidentsData={filteredData}
                      chartDays={timeRanges.length}
                      theme={theme}
                    />
                  </StackItem>
                  <StackItem>
                    <AlertsChart chartDays={timeRanges.length} theme={theme} />
                  </StackItem>
                </>
              )}
              <StackItem>
                <IncidentsTable />
              </StackItem>
            </Stack>
          </PageSection>
        )}
      </PageSection>
    </>
  );
};

const incidentsPageWithFallback = withFallback(IncidentsPage);

export default incidentsPageWithFallback;
