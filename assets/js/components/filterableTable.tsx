import { h, Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { Table, Input, Button, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import useRoms, { Roms } from '../hooks/useRoms';

const FilterTable = () => {
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const { data } = useRoms({});

    useEffect(() => {
        console.log('ROMs data loaded:', data?.length, 'items');
    }, [data]);

    const handleSearch = (selectedKeys: any[], confirm: () => void, dataIndex: string) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters: () => void) => {
        clearFilters();
        setSearchText('');
    };

    const getColumnSearchProps = (dataIndex: keyof Roms, title: string) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
            <div style={{ padding: 8 }}>
                <Input
                    placeholder={`Search ${title}`}
                    value={selectedKeys[0]}
                    onChange={(e: any) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value: any, record: Roms) =>
            record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '',
    });

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            ...getColumnSearchProps('name', 'Name'),
        },
        {
            title: 'Path',
            dataIndex: 'path',
            key: 'path',
            ...getColumnSearchProps('path', 'Path'),
        },
        {
            title: 'MD5',
            dataIndex: 'md5',
            key: 'md5',
            ...getColumnSearchProps('md5', 'MD5'),
        },
    ];

    // Add rowKey to use md5 as unique identifier for each row
    // Add pagination to handle large datasets
    return (
        <Table
            dataSource={data}
            columns={columns}
            rowKey="md5"
            pagination={{
                pageSize: 50,
                showSizeChanger: true,
                pageSizeOptions: ['10', '25', '50', '100', '200'],
                showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} of ${total} ROMs`
            }}
        />
    );
};

export default FilterTable;
