import React, {useEffect, useState, ChangeEvent} from 'react';
import darkIcon from '../images/DarkModeSvg.svg';
import lightIcon from '../images/SunSvg.svg';
import profilePic from '../images/ronaldprofilepic1.png';
import logoutIcon from '../images/logoutIcon.svg';
import searchIcon from '../images/searchIcon.svg';
import Loader from './Loader';
import jwtDecode from 'jwt-decode';
import ContentButton from '../Components/ContentButton';
import noNotesImage from '../images/noNotes.svg';
import addIcon from '../images/addIcon.svg';
import DesktopNote from '../Components/DesktopNote';
import axios from 'axios';
import NoteOptions from '../Components/NoteOptions';
import NewNote from '../Pages/NewNote';
import {Route, Switch} from 'react-router-dom';
import Paragraph from './Paragraph';
import NewDesktopNote from './newDesktopNote';
import ViewDesktopNote from './ViewDesktopNote';
import EditDesktopNote from './EditDesktopNote';

interface DesktopDashboardContentProps {
    history: {push : (routeName: string) => void, goBack : () => {}, replace : (routeName: string) => void};
    match: {params: {noteId: string, userId: string}, url: string};

}

interface Note {
    _id: string;
    userId: string;
    _v?: number;
    selectedColor: string;
    title: string;
    noteContent: string;
    dateCreated: string;
    imageUrl?: string;
}

const DesktopDashboardContent : React.FC<DesktopDashboardContentProps> = ({history, match}) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [currentNoteId, setCurrentNoteId] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [noteOptionsIsShowing, setNoteOptionsIsShowing] = useState<boolean>(false);
    const [filteredNotes, setFilteredNotes] = useState(notes);
    const [searchValue, setSearchValue] = useState<string>('');
    const [isDarkTheme, setIsDarkTheme] = useState<boolean>(false);
    const [selectedContentButton, setSelectedContentButton] = useState<string>("All notes")
    const [user, setUser] = useState<{_id?: string, firstName?: string}>({_id: '', firstName: ''});
    const onDarkModeButtonClick = () => {
        setIsDarkTheme(!isDarkTheme);
        const htmlElement = document.querySelector('html');
        if (htmlElement){
            htmlElement.classList.toggle('dark');
        }
    }
    const onNewNoteButtonClick = () => {
        history.push('/desktopDashboard/newNote');
    }
    const removeNote = (id: string) => {
        const newArray = filteredNotes.filter(note => note._id !== id);
        setFilteredNotes(newArray);
    }
    useEffect(() => {
        const fetchAllNotes = async (userObject: {_id: string, firstName: string}) => {
            try {
                setLoading(true);
                const apiEndpoint = `http://localhost:4000/api/v1/notes/${userObject._id}`;
                const {data} = await axios.get(apiEndpoint);
                setNotes(data);
                setFilteredNotes(data.reverse());
            } catch (error) {
                
            }finally {
                setLoading(false);
            }

        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                history.push('/signIn');
            } else{
                const user = jwtDecode(token) as {_id: string, firstName: string};
                setUser(user);
                fetchAllNotes(user);
                console.log(user);
            }
        } catch(error: any) {
            if (error.message) {
                console.log(error.message);
                history.push('/signIn');

            }
        }
        
        
    }, [])
    const darkModeButtonClasses = "w-[93px] h-[45px] rounded-[22.5px] bg-[#BFBFBF] dark:bg-[#000000] mr-[50px] darkModeButton ";
    const onSearchChange = (e : ChangeEvent<HTMLInputElement>) => {
        const input = e.currentTarget.value;
        setSearchValue(input);

        // Filter the notes
        if (searchValue) {
            const filtered = notes.filter(note => {
                return note.title.toLowerCase().includes(input.toLowerCase()) || note.noteContent.toLowerCase().includes(input.toLowerCase());
            })
            setFilteredNotes(filtered)
        }
    }

    return (
        <div className='transition-all dark:bg-[#0E121A] bg-[#f2f2f2] w-full h-full overflow-hidden'>
            <div className='max-w-[1400px] mx-auto'>
                <section className="w-full pl-[45px] pr-[60px] flex justify-between ">
                    <h1 className='mt-[25px] text-[32px] dark:text-white font-bold'>Hi Ronald<span className='text-[45px]'>👋</span></h1>
                    <div className='flex flex-row items-center mt-[24px]'>
                    <button className={isDarkTheme? darkModeButtonClasses : darkModeButtonClasses + 'active'} onClick={onDarkModeButtonClick}>
                                <div className="w-[35px] h-[35px] bg-[white] rounded-full ml-[7.5px] flex items-center justify-center">
                                    <img alt="icon" className="darkModeIcon" src={darkIcon} />
                                    <img alt="icon" className="lightModeIcon" src={lightIcon} />
                                </div>
                            </button>
                            <div className="w-[50px] h-[50px] mr-[50px] rounded-full overflow-hidden">
                                <img alt="icon" className="w-full h-full" src={profilePic}/>
                            </div>
                            <div className="w-[34px] h-[39px] p-[4px] rounded-full overflow-hidden">
                                <img alt="icon" className="w-full h-full" src={logoutIcon}/>
                            </div>
                    </div>
                </section>
                <section className="pl-[25px] pr-[40px] grid grid-cols-[35%_auto] gap-[20px] mt-[28px] h-[calc(100vh-120px)]">
                    <div>
                        <div className="w-[calc(100% - 56px)] bg-[white] dark:bg-[#1E1D2C] h-[54px] rounded-[15px] mx-[25px] px-[18px] flex items-center searchInputGroup">
                            <img alt="icon" className="w-[30px] h-[30px] mr-[17px] fill-[white]" src={searchIcon} />
                            <input className="transition-all w-full h-[39px] bg-transparent focus:outline-[0] text-[22px] text-[#5c426c] dark:text-[#48485D] placeholder:text-[grey] dark:placeholder:text-[#48485D] font-bold" placeholder="Search your notes" onChange={onSearchChange} value={searchValue}/>
                        </div>
                        {loading && <Loader />}
                        {/* TODO: Fix the problem of the note shadows being truncated by hiding the overflow of the container */}
                        <section className="pt-[30px] grid grid-cols-2  gap-[15px] pb-[20px] max-h-[calc(100vh-175px)] px-[25px] overflow-y-hidden">
                        <div className="flex flex-col">
                            {filteredNotes.map(note => {
                                if (filteredNotes.indexOf(note) % 2 === 0){
                                    return note.imageUrl ? <DesktopNote removeNote={removeNote} onDesktop={true} history={history} match={match} setCurrentNoteId={setCurrentNoteId} setNoteOptionsIsShowing={setNoteOptionsIsShowing} color={note.selectedColor} imageUrl={note.imageUrl} title={note.title} noteContent={note.noteContent} dateCreated={note.dateCreated} key={filteredNotes.indexOf(note)} _id={note._id} userId={note.userId}/> : <DesktopNote removeNote={removeNote} onDesktop={true} history={history} match={match} setCurrentNoteId={setCurrentNoteId} setNoteOptionsIsShowing={setNoteOptionsIsShowing} color={note.selectedColor} title={note.title} noteContent={note.noteContent} dateCreated={note.dateCreated} key={filteredNotes.indexOf(note)} _id={note._id} userId={note.userId}/>
                                }
                            })}
                        </div>
                        <div className="flex flex-col">
                            {filteredNotes.map(note => {
                                if (filteredNotes.indexOf(note) % 2 === 1){
                                    return note.imageUrl ? <DesktopNote removeNote={removeNote} onDesktop={true} history={history} match={match} setCurrentNoteId={setCurrentNoteId} setNoteOptionsIsShowing={setNoteOptionsIsShowing} color={note.selectedColor} imageUrl={note.imageUrl} title={note.title} noteContent={note.noteContent} dateCreated={note.dateCreated} key={filteredNotes.indexOf(note)} _id={note._id} userId={note.userId}/> : <DesktopNote removeNote={removeNote} onDesktop={true} history={history} match={match} setCurrentNoteId={setCurrentNoteId} setNoteOptionsIsShowing={setNoteOptionsIsShowing} color={note.selectedColor} title={note.title} noteContent={note.noteContent} dateCreated={note.dateCreated} key={filteredNotes.indexOf(note)} _id={note._id} userId={note.userId}/>
                                }
                            })}
                        </div>
                    </section>
                    </div>
                    <div className='pb-[50px]'>
                        <div className='transition-all dark:bg-[#151722] bg-white rounded-[30px] w-[90%] h-full mx-auto '>
                            <Switch>
                                <Route path="/desktopDashboard" component={Paragraph} exact/>
                                <Route path="/desktopDashboard/newNote" render={() => <NewDesktopNote notes={filteredNotes} setNotes={setFilteredNotes} history={history}/>} exact/>
                                <Route path="/desktopDashboard/viewNote/:userId/:noteId" component={ViewDesktopNote} exact/>
                                <Route path="/desktopDashboard/editNote/:userId/:noteId" render={() => <EditDesktopNote notes={filteredNotes} setNotes={setFilteredNotes} historyObject={history}/>} exact/>
                            </Switch>
                            {/* <NewNote history={history}/> */}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default DesktopDashboardContent;