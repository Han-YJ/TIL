# React-calendar-timeline
  - 업데이트 안된지 좀 되긴했지만 그래도 사용 할 만 하다

## Usage
```js
    <Timeline
      className='sticky'
      groups={groups}
      items={items}
      canMove={false}
      canResize={false}
      canChangeGroup={false}
      minResizeWidth={100}
      //설정 해놓긴 했는데 제대로 적용x
      defaultTimeStart={getTimeNum(start)}
      defaultTimeEnd={getTimeNum(end)}
      sidebarWidth={windowWidth > 600 ? 400 : sidebarTitleWidth}
      lineHeight={windowWidth > 600 ? 30 : 60}
      //screen width에 따라 sidebar와 lineheight 조절
      minZoom={7 * 24 * 60 * 60 * 1000} //24hour * 7
      maxZoom={7 * 24 * 60 * 60 * 1000}
      //zoom in, zoom out 되지 않게 설정
      onTimeChange={(_start, _end, updateScrollCanvas) => {
        //검색해온 데이터 날짜 범위 내에서만 스크롤 가능하게 제한
        const minTime = getTimeNum(start);
        const maxTime = getTimeNum(end);

        if (_start < minTime && _end > maxTime) {
          updateScrollCanvas(minTime, maxTime);
        } else if (_start < minTime) {
          updateScrollCanvas(minTime, minTime + (_end - _start));
        } else if (_end > maxTime) {
          updateScrollCanvas(maxTime - (_end - _start), maxTime);
        } else {
          updateScrollCanvas(_start, _end);
        }
      }}
      groupRenderer={GroupRenderer}
      itemRenderer={ItemRenderer}
      itemTouchSendsClick={false}

    >
      <TimelineHeaders>
        <SidebarHeader>
          {({ getRootProps }) => {
            return <div className={styles.sidebar} {...getRootProps()}></div>;
          }}
        </SidebarHeader>
        <DateHeader unit='day' />
      </TimelineHeaders>
    </Timeline>
  //DateHeader는 day만 사용, format 변경
  //...

  //GroupRenderer, ItemRenderer
  const GroupRenderer = ({ group }) => {
  const classes = useStyles();
  const groupNames = group.title.split('/');
  const title = groupNames[0];
  const subTitle = groupNames[1];
  return (
    <div className={classes.group}>
      <div className={classes.title}>{title}</div>
      <div className={classes.subTitle}>{subTitle}</div>
    </div>
  );
};

const ItemRenderer = ({ item, itemContext, getItemProps }) => {
  const { selected } = itemContext;
  const backgroundColor = selected ? '#EDAB63' : '#ED6663';
  //selected => 색 변화 + 툴팁 (include detail info) show
  const title = (item) => {
    const { title, start_time, end_time } = item;

    return (
      <div className={styles.tooltip}>
        <p className={styles.title}>{title.split('/')[1]}</p>
        <p className={styles.subTitle}>{title.split('/')[0]}</p>
        <ul className={styles.term}>
          <li>
            시작날짜 : {format(start_time, 'MM월 dd일 HH:mm:ss')}
          </li>
          <li>
            종료날짜 : {format(end_time, 'MM월 dd일 HH:mm:ss')}
          </li>
        </ul>
      </div>
    );
  };

  return (
    <div
      {...getItemProps({
        style: {
          background: 'none',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
        },
      })}
    >
      <LightTooltip //material ui Tooltip사용 (custom tooltip)
        disableFocusListener
        title={title(item)}
        open={selected} //selected되면 표시
        arrow
      >
        <div
          style={{
            width: '100%',
            height: 10,
            overflow: 'hidden',
            paddingLeft: 3,
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            backgroundColor,
            borderRadius: 8,
            pointerEvents: 'none',
            zIndex: 85,
          }}
        ></div>
      </LightTooltip>
    </div>
  );
};

```

### 참고
- https://github.com/namespace-ee/react-calendar-timeline