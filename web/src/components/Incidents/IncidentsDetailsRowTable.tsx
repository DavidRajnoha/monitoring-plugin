import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import {
  GreenCheckCircleIcon,
  ResourceIcon,
  Timestamp,
  useActiveNamespace,
} from '@openshift-console/dynamic-plugin-sdk';
import { BellIcon } from '@patternfly/react-icons';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import { RuleResource } from '../utils';
import { useTranslation } from 'react-i18next';
import { getRuleUrl, usePerspective } from '../hooks/usePerspective';
import './incidents-styles.css';
import { SeverityBadge } from '../alerting/AlertUtils';
import { DataTestIDs } from '../data-test';

const IncidentsDetailsRowTable = ({ alerts }) => {
  const [namespace] = useActiveNamespace();
  const { perspective } = usePerspective();
  const { t } = useTranslation(process.env.I18N_NAMESPACE);

  return (
    <Table borders={false} variant="compact" data-test={DataTestIDs.IncidentsDetailsTable.Table}>
      <Thead>
        <Tr>
          <Th width={25}>{t('Alert Rule')}</Th>
          <Th width={15}>{t('Namespace')}</Th>
          <Th width={10}>{t('Severity')}</Th>
          <Th width={10}>{t('State')}</Th>
          <Th width={20}>{t('Start')}</Th>
          <Th width={20}>{t('End')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {!alerts ? (
          <Bullseye>
            <Spinner
              aria-label="incidents-chart-spinner"
              data-test={DataTestIDs.IncidentsDetailsTable.LoadingSpinner}
            />
          </Bullseye>
        ) : (
          alerts?.map((alertDetails, rowIndex) => {
            return (
              <Tr key={rowIndex} data-test={`${DataTestIDs.IncidentsDetailsTable.Row}-${rowIndex}`}>
                <Td
                  dataLabel="expanded-details-alertname"
                  data-test={`${DataTestIDs.IncidentsDetailsTable.AlertRuleCell}-${rowIndex}`}
                >
                  <ResourceIcon kind={RuleResource.kind} />
                  <Link
                    to={getRuleUrl(perspective, alertDetails?.rule, namespace)}
                    data-test={`${DataTestIDs.IncidentsDetailsTable.AlertRuleLink}-${rowIndex}`}
                  >
                    {alertDetails.alertname}
                  </Link>
                </Td>
                <Td
                  dataLabel="expanded-details-namespace"
                  data-test={`${DataTestIDs.IncidentsDetailsTable.NamespaceCell}-${rowIndex}`}
                >
                  {alertDetails.namespace || '---'}
                </Td>
                <Td
                  dataLabel="expanded-details-severity"
                  data-test={`${DataTestIDs.IncidentsDetailsTable.SeverityCell}-${rowIndex}`}
                >
                  <SeverityBadge severity={alertDetails.severity} />
                </Td>
                <Td
                  dataLabel="expanded-details-alertstate"
                  data-test={`${DataTestIDs.IncidentsDetailsTable.StateCell}-${rowIndex}`}
                >
                  {!alertDetails.resolved ? (
                    <>
                      <BellIcon />
                      <span className="expanded-details-text-margin">Firing</span>
                    </>
                  ) : (
                    <>
                      <GreenCheckCircleIcon />
                      <span className="expanded-details-text-margin">Resolved</span>
                    </>
                  )}
                </Td>
                <Td
                  dataLabel="expanded-details-firingstart"
                  data-test={`${DataTestIDs.IncidentsDetailsTable.StartCell}-${rowIndex}`}
                >
                  <Timestamp simple={true} timestamp={alertDetails.alertsStartFiring} />
                </Td>
                <Td
                  dataLabel="expanded-details-firingend"
                  data-test={`${DataTestIDs.IncidentsDetailsTable.EndCell}-${rowIndex}`}
                >
                  {!alertDetails.resolved ? (
                    '---'
                  ) : (
                    <Timestamp simple={true} timestamp={alertDetails.alertsEndFiring} />
                  )}
                </Td>
              </Tr>
            );
          })
        )}
      </Tbody>
    </Table>
  );
};

export default IncidentsDetailsRowTable;
