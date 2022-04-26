## File upload
이미지나 파일 등등 같은 방법


### DB에 직접 넣기/보내기
### 1. 넣기
- 잘 쓰는 방법은 아니지만 써야만해서 찾아보았다.
```js
const formData = new FormData();
formData.append('image', image);
formData.append('menuCode', menuCode);
formData.append('action', action);//add or update분기

dataService.addOrUpdateMenuImage(formData)
  .catch((err) => console.log(err));


//dataService
async addOrUpdateMenuImage(formdata) {
    console.log(formdata);
    const url = '/modify_image.php';

    const result = await this.dataService
      .post(`${url}`, formdata, {
        headers: { 'content-type': 'multipart/form-data' },
      })
      .catch((err) => console.log(err));

    return result;
  }

```

```php
//file 외 params는 $_POST 로 받기
$menu_code = $_POST['menuCode'];
$action = $_POST['action'];

//file은 $_FILES로
$image = file_get_contents($_FILES['image']['tmp_name']);
//tmp_name은 임시로 저장한 파일 경로
$unpack = unpack("H*hex", $image);
$hex = "0x" . $unpack['hex'];

$sql = "INSERT INTO [dbo].[Menu_image](menu_code, image) VALUES($menu_code, $hex)";
```

### 2. 꺼내기
```PHP
while ($row = mssql_fetch_array($stmt))
{
  $menu_code = $row[1];
  $image = base64_encode($row[2]);
  //base64로 인코딩해서 보냄
}
```

```js
const getMenuImage = (menuCode) => {
  dataService
    .getMenuImages({ action: 'getMenuImage', menuCode })
    .then((res) => {      
      const base64 = res.image;
      const src = `data:image/png;base64,${base64}`;
      setMenuImage(src);
    })
    .catch((err) => console.log(err));
};

//... 

{menuImage && <img src={menuImage} alt='미리보기 이미지' />}

```

### DB에 path 저장 (서버에 업로드)
 - move_uploaded_file

```php
//formdata로 보내는 것까지는 동일

$filePath = "imgs/"; //저장할 위치
$currentTime = date("Y-m-d H-i-s");
$extension = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);

$image_path = $filePath . $code . "_" . $currentTime . "." . $extension;

//file sav 
move_uploaded_file($_FILES["file"]['tmp_name'], $image_path);

```

### 서버에 업로드 시 임시 폴더에 저장했다가 실제 저장 경로로 옮기기
- 문제 : 글쓰기 등에서 글을 등록하지도, 파일을 지우지도 않고 그냥 종료하는 경우 쓸모없는 파일이 서버에 저장된 채로 남음
- 해결 : 글 작성 중에 첨부된 파일들은 temp폴더에 저장하고, 글 등록시 실제 저장 경로로 파일을 이동 (html을 저장하는 경우 editor의 getData string의 경로도 변경해야 함)

```php
if ( file_exists($temp_full_path )) 
{  
  if ( rename($temp_full_path, $full_path )) 
  {
    //temp폴더에 파일이 있을 경우 rename으로 경로수정해서 파일 이동
    //파일 이동하는 방법 
    /* 1. copy and delete
       2. rename
       3. exec 함수로 mv 명령어 호출 
       등이 있지만 copy and delete는 속도가 느릴수도 있어서 두번째방법으로 파일 이동. 아주 간단했다!  */       
  }
}

```


